import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Invoice {
    id?: number;
    number: string;
    date: string;
    amount: number;
    file_url?: string;
    maintenance_id?: number;
}

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = `${environment.apiUrl}/invoices/`;

    constructor(private http: HttpClient) { }

    getInvoices(): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(this.apiUrl);
    }

    createInvoice(invoice: Invoice): Observable<Invoice> {
        return this.http.post<Invoice>(this.apiUrl, invoice);
    }

    updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
        return this.http.put<Invoice>(`${this.apiUrl}${id}`, invoice);
    }

    deleteInvoice(id: number): Observable<Invoice> {
        return this.http.delete<Invoice>(`${this.apiUrl}${id}`);
    }
}
