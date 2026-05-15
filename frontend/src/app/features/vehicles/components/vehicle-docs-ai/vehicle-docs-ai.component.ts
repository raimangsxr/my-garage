import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { finalize } from 'rxjs';
import { Subscription, interval } from 'rxjs';

import {
    VehicleChatResponse,
    VehicleDocument,
    VehicleDocumentUploadEvent,
    VehicleDocumentType,
    VehicleRagService
} from '../../../../core/services/vehicle-rag.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageLoaderComponent } from '../../../../shared/components/page-loader/page-loader.component';

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
    @Input({ required: true }) vehicleId!: number;
    @Input() vehicleLabel = 'this vehicle';
    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

    private ragService = inject(VehicleRagService);
    private logger = inject(LoggerService);
    private snackBar = inject(MatSnackBar);
    private confirmDialog = inject(ConfirmDialogService);
    private pollingSubscription?: Subscription;
    private lastKnownStatuses = new Map<number, string>();
    private deletingDocumentIds = new Set<number>();

    loadingDocuments = false;
    asking = false;
    documents: VehicleDocument[] = [];
    pendingUploads: PendingUpload[] = [];
    selectedDocumentType: VehicleDocumentType = 'owner_manual';
    chatQuestion = '';
    chatScope: 'all_documents' | 'manuals_only' = 'all_documents';
    includeInvoiceDocs = true;
    messages: ChatMessage[] = [];

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
    }

    ngOnDestroy(): void {
        this.pollingSubscription?.unsubscribe();
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
                },
                error: (error) => {
                    this.logger.error('Error loading vehicle documents', error);
                    if (!options.silent) {
                        this.showSnackBar('Error loading vehicle documents');
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
                        this.showSnackBar(`${file.name} uploaded. Indexing has started.`);
                    },
                    error: (error) => {
                        remaining -= 1;
                        this.logger.error('Error uploading vehicle document', error);
                        this.updatePendingUpload(uploadId, {
                            progress: 0,
                            status: 'failed',
                            errorMessage: error?.error?.detail || `Error uploading ${file.name}`
                        });
                        this.showSnackBar(error?.error?.detail || `Error uploading ${file.name}`);
                    }
                });
        });

        input.value = '';
    }

    reindexDocument(document: VehicleDocument): void {
        this.ragService.reindexDocument(document.id).subscribe({
            next: () => {
                this.showSnackBar('Document queued for reindexing. Watch the status pill for progress.');
                this.loadDocuments({ silent: true, merge: true });
            },
            error: (error) => {
                this.logger.error('Error reindexing document', error);
                this.showSnackBar(error?.error?.detail || 'Error reindexing document');
            }
        });
    }

    toggleDocumentInChat(document: VehicleDocument): void {
        this.ragService.updateDocument(document.id, { included_in_rag: !document.included_in_rag }).subscribe({
            next: () => {
                this.showSnackBar(document.included_in_rag ? 'Document excluded from chat' : 'Document included in chat');
                this.loadDocuments();
            },
            error: (error) => {
                this.logger.error('Error updating document visibility', error);
                this.showSnackBar('Error updating document visibility');
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
                        this.showSnackBar('Document deleted');
                        this.documents = this.documents.filter((item) => item.id !== document.id);
                        this.lastKnownStatuses.delete(document.id);
                        this.loadDocuments({ silent: true, merge: true });
                    },
                    error: (error) => {
                        this.logger.error('Error deleting document', error);
                        this.showSnackBar(error?.error?.detail || 'Error deleting document');
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

        this.messages.push({ role: 'user', content: question });
        this.asking = true;
        this.ragService.ask(this.vehicleId, {
            question,
            source_scope: this.chatScope,
            include_invoice_docs: this.includeInvoiceDocs
        }).pipe(
            finalize(() => this.asking = false)
        ).subscribe({
            next: (response) => {
                this.messages.push({
                    role: 'assistant',
                    content: response.answer,
                    response
                });
                this.chatQuestion = '';
            },
            error: (error) => {
                this.logger.error('Error asking vehicle RAG chat', error);
                this.showSnackBar(error?.error?.detail || 'Error asking the vehicle assistant');
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

    private showSnackBar(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
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
                    this.showSnackBar(`Indexing ${document.title || document.file_name}...`);
                } else if (document.status === 'ready') {
                    this.showSnackBar(`${document.title || document.file_name} indexed successfully.`);
                } else if (document.status === 'failed') {
                    this.showSnackBar(document.error_message || `${document.title || document.file_name} failed to index.`);
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
}
