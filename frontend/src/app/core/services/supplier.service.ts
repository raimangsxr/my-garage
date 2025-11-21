import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Supplier {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = `${environment.apiUrl}/suppliers/`;

    constructor(private http: HttpClient) { }

    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.apiUrl);
    }

    createSupplier(supplier: Supplier): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, supplier);
    }

    updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.apiUrl}${id}`, supplier);
    }

    deleteSupplier(id: number): Observable<Supplier> {
        return this.http.delete<Supplier>(`${this.apiUrl}${id}`);
    }
}
