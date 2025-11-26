import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Invoice {
    id?: number;
    number?: string;
    date?: string;
    amount?: number;
    file_url: string;
    file_name?: string;
    status: 'pending' | 'processing' | 'review' | 'approved' | 'failed';
    extracted_data?: string;
    error_message?: string;
    vehicle_id?: number;
    supplier_id?: number;
}

export interface ExtractedPart {
    name: string;
    reference?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface ExtractedMaintenance {
    description: string;
    labor_cost?: number;
    parts: ExtractedPart[];
}

export interface InvoiceExtractedData {
    invoice_number?: string;
    invoice_date?: string;
    supplier_name?: string;
    supplier_address?: string;
    supplier_tax_id?: string;

    is_maintenance: boolean;
    is_parts_only: boolean;

    vehicle_id?: number;
    vehicle_plate?: string;
    vehicle_vin?: string;
    mileage?: number;

    maintenances: ExtractedMaintenance[];
    parts_only: ExtractedPart[];

    subtotal?: number;
    tax_amount?: number;
    total_amount: number;

    confidence: number;
}

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = `${environment.apiUrl}/invoices`;

    constructor(private http: HttpClient) { }

    getInvoices(): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(`${this.apiUrl}/`);
    }

    getInvoice(id: number): Observable<Invoice> {
        return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
    }

    uploadInvoice(file: File, vehicleId?: number): Observable<Invoice> {
        const formData = new FormData();
        formData.append('file', file);
        if (vehicleId) {
            formData.append('vehicle_id', vehicleId.toString());
        }
        return this.http.post<Invoice>(`${this.apiUrl}/upload`, formData);
    }

    getExtractedData(invoiceId: number): Observable<InvoiceExtractedData> {
        return this.http.get<InvoiceExtractedData>(
            `${this.apiUrl}/${invoiceId}/extracted-data`
        );
    }

    updateExtractedData(
        invoiceId: number,
        data: InvoiceExtractedData
    ): Observable<any> {
        return this.http.put(
            `${this.apiUrl}/${invoiceId}/extracted-data`,
            data
        );
    }

    approveInvoice(invoiceId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${invoiceId}/approve`, {});
    }

    deleteInvoice(id: number): Observable<Invoice> {
        return this.http.delete<Invoice>(`${this.apiUrl}/${id}`);
    }

    rejectInvoice(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/reject`, {});
    }

    retryInvoice(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/retry`, {});
    }

    // Polling para estado del procesamiento
    pollInvoiceStatus(invoiceId: number): Observable<Invoice> {
        return interval(2000).pipe(
            switchMap(() => this.http.get<Invoice>(`${this.apiUrl}/${invoiceId}`)),
            takeWhile(invoice =>
                invoice.status === 'pending' || invoice.status === 'processing',
                true
            )
        );
    }
}
