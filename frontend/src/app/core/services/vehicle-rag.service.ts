import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../utils/api-url.util';

export type VehicleDocumentType =
    | 'owner_manual'
    | 'workshop_manual'
    | 'invoice'
    | 'insurance'
    | 'registration'
    | 'other';

export type VehicleDocumentStatus = 'uploaded' | 'indexing' | 'ready' | 'failed';

export interface VehicleDocument {
    id: number;
    vehicle_id: number;
    title?: string | null;
    document_type: VehicleDocumentType;
    mime_type?: string | null;
    file_url: string;
    file_name?: string | null;
    status: VehicleDocumentStatus;
    included_in_rag: boolean;
    error_message?: string | null;
    chunk_count: number;
    indexed_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface VehicleKnowledgeFact {
    id: number;
    vehicle_id: number;
    document_id?: number | null;
    title: string;
    category?: string | null;
    content: string;
    source_excerpt?: string | null;
    confidence?: number | null;
    is_hidden: boolean;
    created_at: string;
    source_label?: string | null;
}

export interface VehicleChatCitation {
    source_id: string;
    source_label: string;
    page_number?: number | null;
    quote: string;
    file_url?: string | null;
    source_type: string;
}

export interface VehicleChatUsedDocument {
    source_label: string;
    file_url?: string | null;
    source_type: string;
}

export interface VehicleChatResponse {
    answer: string;
    citations: VehicleChatCitation[];
    used_documents: VehicleChatUsedDocument[];
    confidence_note: string;
}

export interface VehicleChatRequest {
    question: string;
    source_scope: 'all_documents' | 'manuals_only';
    include_invoice_docs: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class VehicleRagService {
    private http = inject(HttpClient);
    private apiUrl = buildApiUrl('').replace(/\/$/, '');

    listDocuments(vehicleId: number): Observable<VehicleDocument[]> {
        return this.http.get<VehicleDocument[]>(`${this.apiUrl}/vehicles/${vehicleId}/documents`);
    }

    uploadDocument(vehicleId: number, file: File, documentType: VehicleDocumentType, title?: string): Observable<VehicleDocument> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);
        if (title?.trim()) {
            formData.append('title', title.trim());
        }
        return this.http.post<VehicleDocument>(`${this.apiUrl}/vehicles/${vehicleId}/documents/upload`, formData);
    }

    updateDocument(documentId: number, payload: Partial<Pick<VehicleDocument, 'title' | 'document_type' | 'included_in_rag'>>): Observable<VehicleDocument> {
        return this.http.patch<VehicleDocument>(`${this.apiUrl}/vehicle-documents/${documentId}`, payload);
    }

    deleteDocument(documentId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/vehicle-documents/${documentId}`);
    }

    reindexDocument(documentId: number): Observable<VehicleDocument> {
        return this.http.post<VehicleDocument>(`${this.apiUrl}/vehicle-documents/${documentId}/reindex`, {});
    }

    listKnowledge(vehicleId: number, includeHidden = false): Observable<VehicleKnowledgeFact[]> {
        return this.http.get<VehicleKnowledgeFact[]>(
            `${this.apiUrl}/vehicles/${vehicleId}/knowledge`,
            { params: { include_hidden: String(includeHidden) } }
        );
    }

    updateKnowledge(factId: number, payload: Partial<Pick<VehicleKnowledgeFact, 'title' | 'category' | 'content' | 'is_hidden'>>): Observable<VehicleKnowledgeFact> {
        return this.http.patch<VehicleKnowledgeFact>(`${this.apiUrl}/vehicle-knowledge/${factId}`, payload);
    }

    deleteKnowledge(factId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/vehicle-knowledge/${factId}`);
    }

    ask(vehicleId: number, payload: VehicleChatRequest): Observable<VehicleChatResponse> {
        return this.http.post<VehicleChatResponse>(`${this.apiUrl}/vehicles/${vehicleId}/chat/ask`, payload);
    }
}
