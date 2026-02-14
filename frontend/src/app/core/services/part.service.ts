import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { buildApiUrl } from '../utils/api-url.util';
import { PaginatedResponse, normalizePaginated } from '../models/paginated.model';


export interface Part {
    id?: number;
    name: string;
    reference?: string;
    price: number;
    quantity: number;
    maintenance_id?: number;
    supplier_id?: number;
    invoice_id?: number;
    supplier?: any;
    invoice?: any;
}

export interface PartPageOptions {
    skip?: number;
    limit?: number;
    q?: string;
    sortBy?: 'name' | 'reference' | 'price' | 'quantity' | 'id';
    sortDir?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class PartService {
    private apiUrl = buildApiUrl('parts');

    constructor(private http: HttpClient) { }

    getPartsPage(options: PartPageOptions = {}): Observable<PaginatedResponse<Part>> {
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

        return this.http.get<Part[] | PaginatedResponse<Part>>(this.apiUrl, { params: nextParams }).pipe(
            map(response => normalizePaginated(response, skip, limit))
        );
    }

    getParts(): Observable<Part[]> {
        return this.getAllParts(0, []);
    }

    createPart(part: Part): Observable<Part> {
        return this.http.post<Part>(this.apiUrl, part);
    }

    updatePart(id: number, part: Part): Observable<Part> {
        return this.http.put<Part>(`${this.apiUrl}/${id}`, part);
    }

    deletePart(id: number): Observable<Part> {
        return this.http.delete<Part>(`${this.apiUrl}/${id}`);
    }

    private getAllParts(skip: number, acc: Part[]): Observable<Part[]> {
        const pageSize = 200;
        return this.getPartsPage({ skip, limit: pageSize }).pipe(
            switchMap(page => {
                const merged = [...acc, ...page.items];
                if (merged.length >= page.total) {
                    return of(merged);
                }
                return this.getAllParts(skip + pageSize, merged);
            })
        );
    }
}
