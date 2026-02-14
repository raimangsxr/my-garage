import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, map, of, switchMap as rxSwitchMap } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { buildApiUrl } from '../utils/api-url.util';
import { PaginatedResponse, normalizePaginated } from '../models/paginated.model';

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

export interface InvoicePageOptions {
    skip?: number;
    limit?: number;
    q?: string;
    status?: Invoice['status'] | '';
    sortBy?: 'date' | 'amount' | 'number' | 'status' | 'supplier' | 'vehicle' | 'id';
    sortDir?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = buildApiUrl('invoices');

    constructor(private http: HttpClient) { }

    getInvoicesPage(options: InvoicePageOptions = {}): Observable<PaginatedResponse<Invoice>> {
        const skip = options.skip ?? 0;
        const limit = options.limit ?? 100;
        let params = new HttpParams()
            .set('skip', skip)
            .set('limit', limit);

        if (options.q?.trim()) {
            params = params.set('q', options.q.trim());
        }
        if (options.status) {
            params = params.set('status', options.status);
        }
        if (options.sortBy) {
            params = params.set('sort_by', options.sortBy);
        }
        if (options.sortDir) {
            params = params.set('sort_dir', options.sortDir);
        }

        return this.http.get<Invoice[] | PaginatedResponse<Invoice>>(this.apiUrl, { params }).pipe(
            map(response => normalizePaginated(response, skip, limit))
        );
    }

    getInvoices(): Observable<Invoice[]> {
        return this.getAllInvoices(0, []);
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

    private getAllInvoices(skip: number, acc: Invoice[]): Observable<Invoice[]> {
        const pageSize = 200;
        return this.getInvoicesPage({ skip, limit: pageSize }).pipe(
            rxSwitchMap(page => {
                const merged = [...acc, ...page.items];
                if (merged.length >= page.total) {
                    return of(merged);
                }
                return this.getAllInvoices(skip + pageSize, merged);
            })
        );
    }
}
