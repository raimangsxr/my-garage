import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize, interval, Subscription } from 'rxjs';

import { LoggerService } from '../../../../core/services/logger.service';
import { ToastService, ToastTone } from '../../../../core/services/toast.service';
import {
    VehicleChatResponse,
    VehicleDocument,
    VehicleDocumentType,
    VehicleDocumentUploadEvent,
    VehicleRagService
} from '../../../../core/services/vehicle-rag.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageLoaderComponent } from '../../../../shared/components/page-loader/page-loader.component';
import {
    extractQueryAfterWakePhrase,
    inferSpeechLocale,
    mergeVoiceTranscript,
    normalizeTranscript,
    pickBestVoice
} from './vehicle-docs-ai-voice.util';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    response?: VehicleChatResponse;
}

interface PendingUpload {
    id: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'failed';
    errorMessage?: string;
}

type VoiceState = 'idle' | 'armed' | 'listening' | 'transcribing' | 'ready' | 'error' | 'unsupported';

interface BrowserSpeechRecognitionAlternative {
    transcript: string;
}

interface BrowserSpeechRecognitionResultLike {
    isFinal: boolean;
    0: BrowserSpeechRecognitionAlternative;
}

interface BrowserSpeechRecognitionEventLike extends Event {
    resultIndex: number;
    results: ArrayLike<BrowserSpeechRecognitionResultLike>;
}

interface BrowserSpeechRecognitionLike {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: (() => void) | null;
    onresult: ((event: BrowserSpeechRecognitionEventLike) => void) | null;
    onerror: ((event: Event & { error?: string }) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface BrowserSpeechRecognitionConstructor {
    new(): BrowserSpeechRecognitionLike;
}

@Component({
    selector: 'app-vehicle-docs-ai',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatTabsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatSlideToggleModule,
        MatChipsModule,
        EmptyStateComponent,
        PageLoaderComponent
    ],
    templateUrl: './vehicle-docs-ai.component.html',
    styleUrls: ['./vehicle-docs-ai.component.scss']
})
export class VehicleDocsAiComponent implements OnInit, OnDestroy {
    private static readonly ASK_TAB_INDEX = 1;
    private static readonly VOICE_WAKE_PHRASE = 'Hey Garage';
    private static readonly VOICE_SILENCE_TIMEOUT_MS = 1800;

    @Input({ required: true }) vehicleId!: number;
    @Input() vehicleLabel = 'this vehicle';
    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

    private ragService = inject(VehicleRagService);
    private logger = inject(LoggerService);
    private toast = inject(ToastService);
    private confirmDialog = inject(ConfirmDialogService);
    private pollingSubscription?: Subscription;
    private lastKnownStatuses = new Map<number, string>();
    private deletingDocumentIds = new Set<number>();
    private speechRecognition?: BrowserSpeechRecognitionLike;
    private voiceSilenceTimer?: ReturnType<typeof setTimeout>;
    private manualVoiceStopRequested = false;
    private activationFinalTranscript = '';
    private activationInterimTranscript = '';
    private voiceFinalTranscript = '';
    private voiceInterimTranscript = '';
    private shouldRestartVoiceRecognition = false;
    private voiceCancelledByUser = false;
    private voiceRearmTimer?: ReturnType<typeof setTimeout>;
    private availableSpeechVoices: SpeechSynthesisVoice[] = [];
    private readonly handleVoicesChanged = () => {
        this.availableSpeechVoices = this.resolveSpeechVoices();
    };

    loadingDocuments = false;
    asking = false;
    documents: VehicleDocument[] = [];
    pendingUploads: PendingUpload[] = [];
    selectedDocumentType: VehicleDocumentType = 'owner_manual';
    chatQuestion = '';
    chatScope: 'all_documents' | 'manuals_only' = 'all_documents';
    includeInvoiceDocs = true;
    messages: ChatMessage[] = [];
    selectedTabIndex = 0;
    voiceState: VoiceState = this.canUseVoiceInput ? 'idle' : 'unsupported';
    voiceStatusMessage = this.canUseVoiceInput
        ? `Listening starts automatically in Ask. Say "${VehicleDocsAiComponent.VOICE_WAKE_PHRASE}" to begin.`
        : 'Voice activation is not available in this browser.';
    voiceErrorMessage = '';

    readonly documentTypeLabels: Record<VehicleDocumentType, string> = {
        owner_manual: 'Owner Manual',
        workshop_manual: 'Workshop Manual',
        invoice: 'Invoice',
        insurance: 'Insurance',
        registration: 'Registration',
        other: 'Other'
    };

    readonly documentTypeOptions: VehicleDocumentType[] = [
        'owner_manual',
        'workshop_manual',
        'insurance',
        'registration',
        'other'
    ];

    readonly suggestedQuestions = [
        'What engine oil should I use for this vehicle?',
        'What torque specs are mentioned for wheels or brakes?',
        'Summarize the maintenance intervals from the manual.',
        'What parts or service history do the invoices mention?'
    ];

    ngOnInit(): void {
        this.loadDocuments();
        this.startPolling();
        this.availableSpeechVoices = this.resolveSpeechVoices();
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
        }
    }

    ngOnDestroy(): void {
        this.pollingSubscription?.unsubscribe();
        this.stopVoiceListening({ finalize: false, resetTo: this.canUseVoiceInput ? 'idle' : 'unsupported' });
        this.speechRecognition?.abort();
        this.cancelAssistantSpeech();
        this.clearVoiceRearmTimer();
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
        }
    }

    loadDocuments(options: { silent?: boolean; merge?: boolean } = {}): void {
        if (!options.silent) {
            this.loadingDocuments = true;
        }
        this.ragService.listDocuments(this.vehicleId)
            .pipe(finalize(() => {
                if (!options.silent) {
                    this.loadingDocuments = false;
                }
            }))
            .subscribe({
                next: (documents) => {
                    this.handleStatusTransitions(documents);
                    this.documents = options.merge ? this.mergeDocuments(documents) : documents;
                    if (this.selectedTabIndex === VehicleDocsAiComponent.ASK_TAB_INDEX && this.readyDocumentsCount > 0 && !this.voiceCancelledByUser) {
                        this.ensureVoiceArmed();
                    }
                },
                error: (error) => {
                    this.logger.error('Error loading vehicle documents', error);
                    if (!options.silent) {
                        this.showSnackBar('Error loading vehicle documents', 'error');
                    }
                }
            });
    }

    triggerUpload(): void {
        this.fileInput?.nativeElement.click();
    }

    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        if (!files.length) {
            return;
        }

        let remaining = files.length;
        files.forEach((file) => {
            const uploadId = this.createPendingUpload(file);
            this.ragService.uploadDocument(this.vehicleId, file, this.selectedDocumentType)
                .subscribe({
                    next: (event: VehicleDocumentUploadEvent) => {
                        if (event.type === 'progress') {
                            this.updatePendingUpload(uploadId, {
                                progress: Math.max(1, event.progress),
                                status: 'uploading'
                            });
                            return;
                        }

                        remaining -= 1;
                        this.removePendingUpload(uploadId);
                        this.upsertDocument(event.document);
                        if (remaining === 0) {
                            this.loadDocuments({ silent: true, merge: true });
                        }
                        this.showSnackBar(`${file.name} uploaded. Indexing has started.`, 'success');
                    },
                    error: (error) => {
                        remaining -= 1;
                        this.logger.error('Error uploading vehicle document', error);
                        this.updatePendingUpload(uploadId, {
                            progress: 0,
                            status: 'failed',
                            errorMessage: error?.error?.detail || `Error uploading ${file.name}`
                        });
                        this.showSnackBar(error?.error?.detail || `Error uploading ${file.name}`, 'error');
                    }
                });
        });

        input.value = '';
    }

    reindexDocument(document: VehicleDocument): void {
        this.ragService.reindexDocument(document.id).subscribe({
            next: () => {
                this.showSnackBar('Document queued for reindexing. Watch the status pill for progress.', 'info');
                this.loadDocuments({ silent: true, merge: true });
            },
            error: (error) => {
                this.logger.error('Error reindexing document', error);
                this.showSnackBar(error?.error?.detail || 'Error reindexing document', 'error');
            }
        });
    }

    toggleDocumentInChat(document: VehicleDocument): void {
        this.ragService.updateDocument(document.id, { included_in_rag: !document.included_in_rag }).subscribe({
            next: () => {
                this.showSnackBar(
                    document.included_in_rag ? 'Document excluded from chat' : 'Document included in chat',
                    'success'
                );
                this.loadDocuments();
            },
            error: (error) => {
                this.logger.error('Error updating document visibility', error);
                this.showSnackBar('Error updating document visibility', 'error');
            }
        });
    }

    deleteDocument(document: VehicleDocument): void {
        this.confirmDialog.confirm({
            title: 'Delete document',
            message: `Delete "${document.title || document.file_name}" and its indexed knowledge?`,
            confirmText: 'Delete',
            intent: 'danger'
        }).subscribe((confirmed) => {
            if (!confirmed) {
                return;
            }

            this.deletingDocumentIds.add(document.id);
            this.ragService.deleteDocument(document.id)
                .pipe(finalize(() => this.deletingDocumentIds.delete(document.id)))
                .subscribe({
                    next: () => {
                        this.showSnackBar('Document deleted', 'success');
                        this.documents = this.documents.filter((item) => item.id !== document.id);
                        this.lastKnownStatuses.delete(document.id);
                        this.loadDocuments({ silent: true, merge: true });
                    },
                    error: (error) => {
                        this.logger.error('Error deleting document', error);
                        this.showSnackBar(error?.error?.detail || 'Error deleting document', 'error');
                    }
                });
        });
    }

    askSuggestedQuestion(question: string): void {
        this.chatQuestion = question;
        this.askQuestion();
    }

    askQuestion(): void {
        const question = this.chatQuestion.trim();
        if (!question || this.asking) {
            return;
        }

        this.stopVoiceListening({ finalize: false, resetTo: this.canUseVoiceInput ? 'idle' : 'unsupported' });

        this.messages.push({ role: 'user', content: question });
        this.chatQuestion = '';
        this.asking = true;
        this.ragService.ask(this.vehicleId, {
            question,
            source_scope: this.chatScope,
            include_invoice_docs: this.includeInvoiceDocs
        }).pipe(
            finalize(() => {
                this.asking = false;
                if (this.selectedTabIndex === VehicleDocsAiComponent.ASK_TAB_INDEX && !this.voiceCancelledByUser) {
                    this.ensureVoiceArmed();
                }
            })
        ).subscribe({
            next: (response) => {
                this.messages.push({
                    role: 'assistant',
                    content: response.answer,
                    response
                });
                this.speakAssistantResponse(response.answer);
                this.chatQuestion = '';
            },
            error: (error) => {
                this.logger.error('Error asking vehicle RAG chat', error);
                this.showSnackBar(error?.error?.detail || 'Error asking the vehicle assistant', 'error');
            }
        });
    }

    openSource(fileUrl?: string | null): void {
        if (!fileUrl) {
            return;
        }
        window.open(fileUrl, '_blank', 'noopener');
    }

    openCitation(fileUrl?: string | null, pageNumber?: number | null): void {
        this.openSource(this.buildSourceUrl(fileUrl, pageNumber));
    }

    buildCitationAriaLabel(sourceLabel: string, pageNumber?: number | null): string {
        return pageNumber
            ? `Open ${sourceLabel} on page ${pageNumber}`
            : `Open ${sourceLabel}`;
    }

    get readyDocumentsCount(): number {
        return this.documents.filter((document) => document.status === 'ready').length;
    }

    get indexingDocumentsCount(): number {
        return this.documents.filter((document) => document.status === 'uploaded' || document.status === 'indexing').length;
    }

    get failedDocumentsCount(): number {
        return this.documents.filter((document) => document.status === 'failed').length;
    }

    isDeletingDocument(documentId: number): boolean {
        return this.deletingDocumentIds.has(documentId);
    }

    dismissPendingUpload(uploadId: string): void {
        this.removePendingUpload(uploadId);
    }

    onTabChange(index: number): void {
        this.selectedTabIndex = index;

        if (index !== VehicleDocsAiComponent.ASK_TAB_INDEX) {
            this.voiceCancelledByUser = false;
            this.stopVoiceListening({ finalize: false, resetTo: this.canUseVoiceInput ? 'idle' : 'unsupported' });
            return;
        }

        if (this.readyDocumentsCount > 0) {
            this.voiceCancelledByUser = false;
            this.ensureVoiceArmed();
        }
    }

    toggleVoiceListening(): void {
        if (!this.canUseVoiceInput) {
            this.setVoiceState('unsupported', 'Voice activation is not available in this browser.');
            return;
        }

        if (this.isVoiceBusy) {
            this.voiceCancelledByUser = true;
            this.stopVoiceListening({ finalize: false, resetTo: 'idle' });
            this.showSnackBar('Voice listening paused.', 'info');
            return;
        }

        this.voiceCancelledByUser = false;
        this.ensureVoiceArmed();
    }

    getDocumentProgress(document: VehicleDocument): number {
        if (document.status === 'ready') {
            return 100;
        }
        return Math.max(0, Math.min(100, document.processing_progress ?? 0));
    }

    getDocumentStageLabel(document: VehicleDocument): string {
        const stage = document.processing_stage || document.status;
        const labels: Record<string, string> = {
            uploaded: 'Uploaded',
            starting: 'Starting',
            extracting_text: 'Extracting text',
            chunking: 'Building chunks',
            knowledge: 'Extracting knowledge',
            ready: 'Ready',
            failed: 'Failed'
        };
        return labels[stage] || stage.replace(/_/g, ' ');
    }

    getDocumentProgressDetail(document: VehicleDocument): string {
        return document.processing_detail || this.getDocumentStageLabel(document);
    }

    trackByDocumentId(index: number, document: VehicleDocument): number {
        return document.id;
    }

    trackByPendingUpload(index: number, upload: PendingUpload): string {
        return upload.id;
    }

    trackByMessage(index: number): number {
        return index;
    }

    get canUseVoiceInput(): boolean {
        return !!this.resolveSpeechRecognitionCtor();
    }

    get voiceWakePhrase(): string {
        return VehicleDocsAiComponent.VOICE_WAKE_PHRASE;
    }

    get isVoiceBusy(): boolean {
        return this.voiceState === 'armed' || this.voiceState === 'listening' || this.voiceState === 'transcribing';
    }

    get voiceToggleLabel(): string {
        return this.isVoiceBusy ? 'Cancel voice listening' : 'Resume voice listening';
    }

    get voiceButtonLabel(): string {
        return this.isVoiceBusy ? 'Cancel listening' : 'Resume listening';
    }

    private showSnackBar(message: string, tone: ToastTone = 'info'): void {
        this.toast.open(message, {
            tone,
            duration: 3000
        });
    }

    private startPolling(): void {
        this.pollingSubscription?.unsubscribe();
        this.pollingSubscription = interval(5000).subscribe(() => {
            if (this.indexingDocumentsCount > 0) {
                this.loadDocuments({ silent: true, merge: true });
            }
        });
    }

    private handleStatusTransitions(documents: VehicleDocument[]): void {
        for (const document of documents) {
            const previousStatus = this.lastKnownStatuses.get(document.id);
            if (previousStatus && previousStatus !== document.status) {
                if (document.status === 'indexing') {
                    this.showSnackBar(`Indexing ${document.title || document.file_name}...`, 'info');
                } else if (document.status === 'ready') {
                    this.showSnackBar(`${document.title || document.file_name} indexed successfully.`, 'success');
                } else if (document.status === 'failed') {
                    this.showSnackBar(
                        document.error_message || `${document.title || document.file_name} failed to index.`,
                        'error'
                    );
                }
            }
            this.lastKnownStatuses.set(document.id, document.status);
        }
    }

    private createPendingUpload(file: File): string {
        const uploadId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.pendingUploads = [
            {
                id: uploadId,
                fileName: file.name,
                progress: 0,
                status: 'uploading'
            },
            ...this.pendingUploads
        ];
        return uploadId;
    }

    private updatePendingUpload(uploadId: string, patch: Partial<PendingUpload>): void {
        this.pendingUploads = this.pendingUploads.map((upload) => (
            upload.id === uploadId ? { ...upload, ...patch } : upload
        ));
    }

    private removePendingUpload(uploadId: string): void {
        this.pendingUploads = this.pendingUploads.filter((upload) => upload.id !== uploadId);
    }

    private upsertDocument(document: VehicleDocument): void {
        const existingIndex = this.documents.findIndex((item) => item.id === document.id);
        if (existingIndex === -1) {
            this.documents = [document, ...this.documents];
            return;
        }

        this.documents = this.documents.map((item) => item.id === document.id ? document : item);
    }

    private mergeDocuments(incomingDocuments: VehicleDocument[]): VehicleDocument[] {
        const currentDocuments = new Map(this.documents.map((document) => [document.id, document]));
        return incomingDocuments.map((incomingDocument) => {
            const currentDocument = currentDocuments.get(incomingDocument.id);
            if (!currentDocument) {
                return incomingDocument;
            }

            return {
                ...currentDocument,
                ...incomingDocument,
            };
        });
    }

    private buildSourceUrl(fileUrl?: string | null, pageNumber?: number | null): string | null | undefined {
        if (!fileUrl) {
            return fileUrl;
        }

        if (!pageNumber) {
            return fileUrl;
        }

        const resolvedUrl = new URL(fileUrl, window.location.origin);
        const fragmentParams = resolvedUrl.hash
            .replace(/^#/, '')
            .split('&')
            .map((value) => value.trim())
            .filter((value) => value.length > 0 && !value.startsWith('page='));

        resolvedUrl.hash = ['page=' + pageNumber, ...fragmentParams].join('&');
        return resolvedUrl.toString();
    }

    private ensureVoiceArmed(): void {
        if (!this.canUseVoiceInput || this.voiceCancelledByUser || this.asking) {
            return;
        }
        if (this.selectedTabIndex !== VehicleDocsAiComponent.ASK_TAB_INDEX || this.readyDocumentsCount === 0) {
            return;
        }
        if (this.isVoiceBusy) {
            return;
        }

        this.clearVoiceRearmTimer();

        const recognition = this.getOrCreateSpeechRecognition();
        if (!recognition) {
            this.setVoiceState('unsupported', 'Voice activation is not available in this browser.');
            return;
        }

        this.manualVoiceStopRequested = false;
        this.shouldRestartVoiceRecognition = true;
        this.resetVoiceBuffers();
        this.voiceErrorMessage = '';
        this.setVoiceState('armed', `Listening in Ask. Say "${this.voiceWakePhrase}" to start your question.`);

        try {
            recognition.start();
            this.logger.info('Vehicle Ask voice trigger armed');
        } catch (error) {
            this.logger.error('Error starting browser speech recognition', error);
            this.setVoiceState('error', 'We could not start voice listening in this browser.', 'Retrying automatically. You can keep typing if needed.');
            this.scheduleVoiceRearm();
        }
    }

    private stopVoiceListening(options: { finalize: boolean; resetTo: VoiceState }): void {
        this.manualVoiceStopRequested = true;
        this.shouldRestartVoiceRecognition = false;
        this.clearVoiceSilenceTimer();

        if (!this.speechRecognition) {
            this.resetVoiceBuffers();
            this.voiceErrorMessage = '';
            this.setVoiceState(options.resetTo, options.resetTo === 'unsupported'
                ? 'Voice activation is not available in this browser.'
                : options.resetTo === 'idle'
                    ? 'Voice trigger paused. Use the button to resume listening.'
                    : `Listening starts automatically in Ask. Say "${this.voiceWakePhrase}" to begin.`);
            return;
        }

        if (options.finalize && this.voiceState === 'listening') {
            this.setVoiceState('transcribing', 'Turning your speech into editable text...');
            this.speechRecognition.stop();
            return;
        }

        this.speechRecognition.abort();
        this.resetVoiceBuffers();
        this.voiceErrorMessage = '';
        this.setVoiceState(options.resetTo, options.resetTo === 'unsupported'
            ? 'Voice activation is not available in this browser.'
            : options.resetTo === 'idle'
                ? 'Voice trigger paused. Use the button to resume listening.'
                : `Listening starts automatically in Ask. Say "${this.voiceWakePhrase}" to begin.`);
    }

    private getOrCreateSpeechRecognition(): BrowserSpeechRecognitionLike | null {
        if (this.speechRecognition) {
            return this.speechRecognition;
        }

        const SpeechRecognitionCtor = this.resolveSpeechRecognitionCtor();
        if (!SpeechRecognitionCtor) {
            return null;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = this.resolveVoiceLanguage();
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => this.handleVoiceResult(event);
        recognition.onerror = (event) => this.handleVoiceError(event);
        recognition.onend = () => this.handleVoiceEnd();
        recognition.onstart = () => {
            this.logger.info('Browser speech recognition started');
        };
        this.speechRecognition = recognition;
        return recognition;
    }

    private handleVoiceResult(event: BrowserSpeechRecognitionEventLike): void {
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = normalizeTranscript(result[0]?.transcript ?? '');

            if (!transcript) {
                continue;
            }

            if (this.voiceState === 'armed') {
                if (result.isFinal) {
                    this.activationFinalTranscript = normalizeTranscript(`${this.activationFinalTranscript} ${transcript}`);
                    this.activationInterimTranscript = '';
                } else {
                    this.activationInterimTranscript = transcript;
                }

                const combinedActivationTranscript = normalizeTranscript(`${this.activationFinalTranscript} ${this.activationInterimTranscript}`);
                const activation = extractQueryAfterWakePhrase(combinedActivationTranscript, this.voiceWakePhrase);

                if (activation.detected) {
                    this.setVoiceState('listening', 'Listening to your question. Stop speaking or press the button when finished.');
                    this.voiceFinalTranscript = normalizeTranscript(activation.queryText);
                    this.voiceInterimTranscript = '';
                    this.activationFinalTranscript = '';
                    this.activationInterimTranscript = '';
                    this.scheduleVoiceSilenceTimeout();
                }
                continue;
            }

            if (this.voiceState !== 'listening' && this.voiceState !== 'transcribing') {
                continue;
            }

            if (result.isFinal) {
                this.voiceFinalTranscript = normalizeTranscript(`${this.voiceFinalTranscript} ${transcript}`);
                this.voiceInterimTranscript = '';
            } else {
                this.voiceInterimTranscript = transcript;
            }
            this.scheduleVoiceSilenceTimeout();
        }
    }

    private handleVoiceError(event: Event & { error?: string }): void {
        this.logger.error('Browser speech recognition failed', event);
        this.clearVoiceSilenceTimer();

        if (event.error === 'no-speech') {
            if (this.voiceState === 'armed') {
                this.setVoiceState('armed', `Listening in Ask. Say "${this.voiceWakePhrase}" to start your question.`);
                return;
            }
            this.finalizeVoiceTranscript('We did not catch a clear question after the wake phrase.');
            return;
        }

        if (event.error === 'aborted' && this.manualVoiceStopRequested) {
            return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            this.shouldRestartVoiceRecognition = false;
            this.setVoiceState('error', 'Microphone access was denied.', 'Allow microphone access in the browser or keep typing your question.');
            return;
        }

        this.shouldRestartVoiceRecognition = false;
        this.setVoiceState('error', 'Voice recognition stopped unexpectedly.', 'Retrying automatically. You can keep typing if needed.');
        this.scheduleVoiceRearm();
    }

    private handleVoiceEnd(): void {
        this.clearVoiceSilenceTimer();

        if (this.voiceState === 'transcribing' || this.voiceState === 'listening') {
            this.finalizeVoiceTranscript();
            return;
        }

        if (this.voiceState === 'armed' && this.shouldRestartVoiceRecognition && !this.manualVoiceStopRequested) {
            try {
                this.speechRecognition?.start();
                return;
            } catch (error) {
                this.logger.error('Error restarting browser speech recognition', error);
                this.scheduleVoiceRearm();
            }
        }

        if (this.manualVoiceStopRequested) {
            this.resetVoiceBuffers();
            this.voiceErrorMessage = '';
            if (this.voiceState !== 'ready') {
                this.setVoiceState(this.canUseVoiceInput ? 'idle' : 'unsupported', this.canUseVoiceInput
                    ? 'Voice trigger paused. Use the button to resume listening.'
                    : 'Voice activation is not available in this browser.');
            }
            return;
        }

        if (!this.voiceCancelledByUser && this.selectedTabIndex === VehicleDocsAiComponent.ASK_TAB_INDEX && this.readyDocumentsCount > 0) {
            this.scheduleVoiceRearm();
        }
    }

    private finalizeVoiceTranscript(emptyMessage = 'We could not build a question from that recording.'): void {
        this.clearVoiceSilenceTimer();
        this.shouldRestartVoiceRecognition = false;
        this.manualVoiceStopRequested = false;

        const transcript = this.voicePreviewTranscriptWithoutWakePhrase();
        if (!transcript) {
            this.resetVoiceBuffers();
            this.setVoiceState('armed', emptyMessage);
            this.ensureVoiceArmed();
            return;
        }

        const mergedTranscript = mergeVoiceTranscript(this.chatQuestion, transcript);
        this.chatQuestion = mergedTranscript.text;
        this.resetVoiceBuffers();
        this.voiceErrorMessage = '';

        if (mergedTranscript.appended) {
            this.showSnackBar('Voice transcription added to the current question.', 'success');
        } else {
            this.showSnackBar('Voice transcription ready to review.', 'success');
        }

        this.setVoiceState('ready', 'Voice transcription ready. Still listening for the next question.');
        if (!this.voiceCancelledByUser && this.selectedTabIndex === VehicleDocsAiComponent.ASK_TAB_INDEX) {
            this.ensureVoiceArmed();
        }
    }

    private scheduleVoiceSilenceTimeout(): void {
        this.clearVoiceSilenceTimer();
        this.voiceSilenceTimer = setTimeout(() => {
            if (this.voiceState === 'listening') {
                this.stopVoiceListening({ finalize: true, resetTo: 'ready' });
            }
        }, VehicleDocsAiComponent.VOICE_SILENCE_TIMEOUT_MS);
    }

    private clearVoiceSilenceTimer(): void {
        if (this.voiceSilenceTimer) {
            clearTimeout(this.voiceSilenceTimer);
            this.voiceSilenceTimer = undefined;
        }
    }

    private scheduleVoiceRearm(delayMs = 350): void {
        if (this.voiceCancelledByUser || !this.canUseVoiceInput) {
            return;
        }
        if (this.selectedTabIndex !== VehicleDocsAiComponent.ASK_TAB_INDEX || this.readyDocumentsCount === 0 || this.asking) {
            return;
        }

        this.clearVoiceRearmTimer();
        this.voiceRearmTimer = setTimeout(() => {
            this.voiceRearmTimer = undefined;
            this.ensureVoiceArmed();
        }, delayMs);
    }

    private clearVoiceRearmTimer(): void {
        if (this.voiceRearmTimer) {
            clearTimeout(this.voiceRearmTimer);
            this.voiceRearmTimer = undefined;
        }
    }

    private setVoiceState(state: VoiceState, statusMessage: string, errorMessage = ''): void {
        this.voiceState = state;
        this.voiceStatusMessage = statusMessage;
        this.voiceErrorMessage = errorMessage;
    }

    private resetVoiceBuffers(): void {
        this.activationFinalTranscript = '';
        this.activationInterimTranscript = '';
        this.voiceFinalTranscript = '';
        this.voiceInterimTranscript = '';
    }

    private voicePreviewTranscriptWithoutWakePhrase(): string {
        const transcript = normalizeTranscript(`${this.voiceFinalTranscript} ${this.voiceInterimTranscript}`);
        if (!transcript) {
            return '';
        }

        const activation = extractQueryAfterWakePhrase(transcript, this.voiceWakePhrase);
        return activation.detected ? activation.queryText : transcript;
    }

    private resolveVoiceLanguage(): string {
        if (typeof navigator === 'undefined' || !navigator.language) {
            return 'en-US';
        }
        return navigator.language;
    }

    private speakAssistantResponse(answer: string): void {
        if (typeof window === 'undefined' || typeof speechSynthesis === 'undefined') {
            return;
        }

        const normalizedAnswer = normalizeTranscript(answer);
        if (!normalizedAnswer) {
            return;
        }

        const preferredLocale = inferSpeechLocale(normalizedAnswer, this.resolveVoiceLanguage());
        const utterance = new SpeechSynthesisUtterance(normalizedAnswer);
        utterance.lang = preferredLocale;

        const bestVoice = pickBestVoice(this.availableSpeechVoices, preferredLocale);
        if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang || preferredLocale;
        }

        utterance.onerror = (event) => {
            this.logger.error('Assistant speech synthesis failed', event);
        };

        this.cancelAssistantSpeech();
        speechSynthesis.speak(utterance);
    }

    private cancelAssistantSpeech(): void {
        if (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }

    private resolveSpeechVoices(): SpeechSynthesisVoice[] {
        if (typeof speechSynthesis === 'undefined') {
            return [];
        }
        return speechSynthesis.getVoices();
    }

    private resolveSpeechRecognitionCtor(): BrowserSpeechRecognitionConstructor | null {
        if (typeof window === 'undefined') {
            return null;
        }

        const speechWindow = window as Window & {
            SpeechRecognition?: BrowserSpeechRecognitionConstructor;
            webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
        };

        return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
    }
}
