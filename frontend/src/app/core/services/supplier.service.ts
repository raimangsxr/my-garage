import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { buildApiUrl } from '../utils/api-url.util';
import { PaginatedResponse, normalizePaginated } from '../models/paginated.model';

export interface Supplier {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface SupplierPageOptions {
    skip?: number;
    limit?: number;
    q?: string;
    sortBy?: 'name' | 'email' | 'phone' | 'address' | 'id';
    sortDir?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = buildApiUrl('suppliers');

    constructor(private http: HttpClient) { }

    getSuppliersPage(options: SupplierPageOptions = {}): Observable<PaginatedResponse<Supplier>> {
        const skip = options.skip ?? 0;
        const limit = options.limit ?? 100;
        const params = new HttpParams()
            .set('skip', skip)
            .set('limit', limit);
        let nextParams = params;
        if (options.q?.trim()) {
            nextParams = nextParams.set('q', options.q.trim());
        }
        if (options.sortBy) {
            nextParams = nextParams.set('sort_by', options.sortBy);
        }
        if (options.sortDir) {
            nextParams = nextParams.set('sort_dir', options.sortDir);
        }

        return this.http.get<Supplier[] | PaginatedResponse<Supplier>>(this.apiUrl, { params: nextParams }).pipe(
            map(response => normalizePaginated(response, skip, limit))
        );
    }

    getSuppliers(): Observable<Supplier[]> {
        return this.getAllSuppliers(0, []);
    }

    createSupplier(supplier: Supplier): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, supplier);
    }

    updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
    }

    deleteSupplier(id: number): Observable<Supplier> {
        return this.http.delete<Supplier>(`${this.apiUrl}/${id}`);
    }

    private getAllSuppliers(skip: number, acc: Supplier[]): Observable<Supplier[]> {
        const pageSize = 200;
        return this.getSuppliersPage({ skip, limit: pageSize }).pipe(
            switchMap(page => {
                const merged = [...acc, ...page.items];
                if (merged.length >= page.total) {
                    return of(merged);
                }
                return this.getAllSuppliers(skip + pageSize, merged);
            })
        );
    }
}
