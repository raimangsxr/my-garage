import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    VehicleDocumentType,
    VehicleKnowledgeFact,
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

@Component({
    selector: 'app-vehicle-docs-ai',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
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

    loadingDocuments = false;
    loadingKnowledge = false;
    asking = false;
    documents: VehicleDocument[] = [];
    knowledge: VehicleKnowledgeFact[] = [];
    selectedDocumentType: VehicleDocumentType = 'owner_manual';
    includeHiddenKnowledge = false;
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
        this.loadKnowledge();
        this.startPolling();
    }

    ngOnDestroy(): void {
        this.pollingSubscription?.unsubscribe();
    }

    loadDocuments(): void {
        this.loadingDocuments = true;
        this.ragService.listDocuments(this.vehicleId)
            .pipe(finalize(() => this.loadingDocuments = false))
            .subscribe({
                next: (documents) => {
                    this.handleStatusTransitions(documents);
                    this.documents = documents;
                },
                error: (error) => {
                    this.logger.error('Error loading vehicle documents', error);
                    this.showSnackBar('Error loading vehicle documents');
                }
            });
    }

    loadKnowledge(): void {
        this.loadingKnowledge = true;
        this.ragService.listKnowledge(this.vehicleId, this.includeHiddenKnowledge)
            .pipe(finalize(() => this.loadingKnowledge = false))
            .subscribe({
                next: (knowledge) => this.knowledge = knowledge,
                error: (error) => {
                    this.logger.error('Error loading vehicle knowledge', error);
                    this.showSnackBar('Error loading knowledge');
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
            this.ragService.uploadDocument(this.vehicleId, file, this.selectedDocumentType)
                .subscribe({
                    next: () => {
                        remaining -= 1;
                        if (remaining === 0) {
                            this.loadDocuments();
                        }
                        this.showSnackBar(`${file.name} uploaded. Indexing has started.`);
                    },
                    error: (error) => {
                        remaining -= 1;
                        this.logger.error('Error uploading vehicle document', error);
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
                this.loadDocuments();
                this.loadKnowledge();
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

            this.ragService.deleteDocument(document.id).subscribe({
                next: () => {
                    this.showSnackBar('Document deleted');
                    this.loadDocuments();
                    this.loadKnowledge();
                },
                error: (error) => {
                    this.logger.error('Error deleting document', error);
                    this.showSnackBar('Error deleting document');
                }
            });
        });
    }

    toggleKnowledgeVisibility(fact: VehicleKnowledgeFact): void {
        this.ragService.updateKnowledge(fact.id, { is_hidden: !fact.is_hidden }).subscribe({
            next: () => {
                this.showSnackBar(fact.is_hidden ? 'Knowledge fact restored' : 'Knowledge fact hidden');
                this.loadKnowledge();
            },
            error: (error) => {
                this.logger.error('Error updating knowledge fact', error);
                this.showSnackBar('Error updating knowledge fact');
            }
        });
    }

    deleteKnowledge(fact: VehicleKnowledgeFact): void {
        this.confirmDialog.confirm({
            title: 'Delete knowledge fact',
            message: `Delete "${fact.title}" from the derived knowledge list?`,
            confirmText: 'Delete',
            intent: 'danger'
        }).subscribe((confirmed) => {
            if (!confirmed) {
                return;
            }

            this.ragService.deleteKnowledge(fact.id).subscribe({
                next: () => {
                    this.showSnackBar('Knowledge fact deleted');
                    this.loadKnowledge();
                },
                error: (error) => {
                    this.logger.error('Error deleting knowledge fact', error);
                    this.showSnackBar('Error deleting knowledge fact');
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

    trackByDocumentId(index: number, document: VehicleDocument): number {
        return document.id;
    }

    trackByKnowledgeId(index: number, fact: VehicleKnowledgeFact): number {
        return fact.id;
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
                this.loadDocuments();
                this.loadKnowledge();
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

    private buildSourceUrl(fileUrl?: string | null, pageNumber?: number | null): string | null | undefined {
        if (!fileUrl) {
            return fileUrl;
        }

        if (!pageNumber || !this.isPdfUrl(fileUrl)) {
            return fileUrl;
        }

        const [baseUrl, fragment = ''] = fileUrl.split('#', 2);
        const fragmentParams = fragment
            .split('&')
            .map((value) => value.trim())
            .filter((value) => value.length > 0 && !value.startsWith('page='));

        return `${baseUrl}#${['page=' + pageNumber, ...fragmentParams].join('&')}`;
    }

    private isPdfUrl(fileUrl: string): boolean {
        return fileUrl.toLowerCase().split('#', 1)[0].includes('.pdf');
    }
}
