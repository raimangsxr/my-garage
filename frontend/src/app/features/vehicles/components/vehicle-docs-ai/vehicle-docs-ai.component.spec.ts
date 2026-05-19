import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggerService } from '../../../../core/services/logger.service';
import { ToastService } from '../../../../core/services/toast.service';
import { VehicleDocument, VehicleRagService } from '../../../../core/services/vehicle-rag.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { VehicleDocsAiComponent } from './vehicle-docs-ai.component';

const readyDocument: VehicleDocument = {
    id: 7,
    vehicle_id: 2,
    title: 'Workshop Manual',
    document_type: 'workshop_manual',
    mime_type: 'application/pdf',
    file_url: '/media/workshop-manual.pdf',
    file_name: 'workshop-manual.pdf',
    status: 'ready',
    included_in_rag: true,
    chunk_count: 14,
    processing_progress: 100,
    indexed_at: '2026-05-18T10:00:00Z',
    created_at: '2026-05-18T09:00:00Z',
    updated_at: '2026-05-18T10:00:00Z',
};

describe('VehicleDocsAiComponent', () => {
    let fixture: ComponentFixture<VehicleDocsAiComponent>;
    let component: VehicleDocsAiComponent;
    let ragService: {
        listDocuments: ReturnType<typeof vi.fn>;
        ask: ReturnType<typeof vi.fn>;
        uploadDocument: ReturnType<typeof vi.fn>;
        updateDocument: ReturnType<typeof vi.fn>;
        deleteDocument: ReturnType<typeof vi.fn>;
        reindexDocument: ReturnType<typeof vi.fn>;
    };
    let logger: {
        info: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
        ragService = {
            listDocuments: vi.fn().mockReturnValue(of([])),
            ask: vi.fn(),
            uploadDocument: vi.fn(),
            updateDocument: vi.fn(),
            deleteDocument: vi.fn(),
            reindexDocument: vi.fn(),
        };

        logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [VehicleDocsAiComponent, NoopAnimationsModule],
            providers: [
                { provide: VehicleRagService, useValue: ragService },
                { provide: LoggerService, useValue: logger },
                { provide: ToastService, useValue: { open: vi.fn() } },
                { provide: ConfirmDialogService, useValue: { confirm: vi.fn() } },
            ],
        }).compileComponents();
    });

    function createComponent(options: { selectedTabIndex?: number } = {}): void {
        fixture = TestBed.createComponent(VehicleDocsAiComponent);
        component = fixture.componentInstance;
        component.vehicleId = 2;
        component.vehicleLabel = 'Ducati Panigale 1299 S';
        if (typeof options.selectedTabIndex === 'number') {
            component.selectedTabIndex = options.selectedTabIndex;
        }
        vi.spyOn(component as any, 'resolveSpeechRecognitionCtor').mockReturnValue(null);
        fixture.detectChanges();
    }

    it('renders a retryable documents error state when initial loading fails', () => {
        ragService.listDocuments.mockReturnValue(
            throwError(() => new HttpErrorResponse({
                status: 503,
                error: { detail: 'Document service unavailable' },
            }))
        );

        createComponent({ selectedTabIndex: 0 });

        expect(component.documentsErrorMessage).toBe('Document service unavailable');
        expect(fixture.nativeElement.textContent).toContain('Document service unavailable');
        expect(fixture.nativeElement.textContent).toContain('Retry');
    });

    it('renders the ask retry card when the assistant request fails', () => {
        ragService.listDocuments.mockReturnValue(of([readyDocument]));
        ragService.ask.mockReturnValue(
            throwError(() => new HttpErrorResponse({
                status: 500,
                error: { detail: 'Assistant timeout' },
            }))
        );

        createComponent();
        component.chatQuestion = 'What oil should I use?';
        component.askQuestion();
        fixture.detectChanges();

        expect(component.askErrorMessage).toBe('Assistant timeout');
        expect(component.lastFailedQuestion).toBe('What oil should I use?');
        expect(fixture.nativeElement.textContent).toContain('Assistant response failed');
        expect(fixture.nativeElement.textContent).toContain('Retry answer');
    });

    it('stops rearming voice recognition when microphone permission is denied', () => {
        ragService.listDocuments.mockReturnValue(of([readyDocument]));

        createComponent();

        (component as any).handleVoiceError({ error: 'not-allowed' } as Event & { error?: string });

        expect(logger.warn).toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(component.voiceState).toBe('error');
        expect(component.voiceStatusMessage).toBe('Microphone access was denied.');
        expect(component.voiceErrorMessage).toContain('Allow microphone access');
        expect((component as any).voiceCancelledByUser).toBe(true);
        expect((component as any).shouldRestartVoiceRecognition).toBe(false);
    });

    it('treats missing audio capture as a stable voice error instead of a retry loop', () => {
        ragService.listDocuments.mockReturnValue(of([readyDocument]));

        createComponent();

        (component as any).handleVoiceError({ error: 'audio-capture' } as Event & { error?: string });

        expect(logger.warn).toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(component.voiceState).toBe('error');
        expect(component.voiceStatusMessage).toBe('Microphone input is not available.');
        expect(component.voiceErrorMessage).toContain('reconnect a microphone');
        expect((component as any).voiceCancelledByUser).toBe(true);
        expect((component as any).shouldRestartVoiceRecognition).toBe(false);
    });
});
