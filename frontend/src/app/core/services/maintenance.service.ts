import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { buildApiUrl } from '../utils/api-url.util';
import { PaginatedResponse, normalizePaginated } from '../models/paginated.model';

import { Vehicle } from './vehicle.service';
import { Supplier } from './supplier.service';
import { Part } from './part.service';
import { Invoice } from './invoice.service';

export interface Maintenance {
    id?: number;
    vehicle_id: number;
    date: string;
    description: string;
    mileage: number;
    cost: number;
    supplier_id?: number;
    vehicle?: Vehicle;
    supplier?: Supplier;
    parts?: Part[];
    invoices?: Invoice[];
}

export interface MaintenancePageOptions {
    skip?: number;
    limit?: number;
    q?: string;
    sortBy?: 'date' | 'description' | 'cost' | 'mileage' | 'vehicle' | 'supplier' | 'id';
    sortDir?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {
    private apiUrl = buildApiUrl('maintenance');

    constructor(private http: HttpClient) { }

    getMaintenancesPage(options: MaintenancePageOptions = {}): Observable<PaginatedResponse<Maintenance>> {
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

        return this.http.get<Maintenance[] | PaginatedResponse<Maintenance>>(this.apiUrl, { params: nextParams }).pipe(
            map(response => normalizePaginated(response, skip, limit))
        );
    }

    getMaintenances(): Observable<Maintenance[]> {
        return this.getAllMaintenances(0, []);
    }

    getMaintenance(id: number): Observable<Maintenance> {
        return this.http.get<Maintenance>(`${this.apiUrl}/${id}`);
    }

    createMaintenance(maintenance: Maintenance): Observable<Maintenance> {
        return this.http.post<Maintenance>(this.apiUrl, maintenance);
    }

    updateMaintenance(id: number, maintenance: Maintenance): Observable<Maintenance> {
        return this.http.put<Maintenance>(`${this.apiUrl}/${id}`, maintenance);
    }

    deleteMaintenance(id: number): Observable<Maintenance> {
        return this.http.delete<Maintenance>(`${this.apiUrl}/${id}`);
    }

    private getAllMaintenances(skip: number, acc: Maintenance[]): Observable<Maintenance[]> {
        const pageSize = 200;
        return this.getMaintenancesPage({ skip, limit: pageSize }).pipe(
            switchMap(page => {
                const merged = [...acc, ...page.items];
                if (merged.length >= page.total) {
                    return of(merged);
                }
                return this.getAllMaintenances(skip + pageSize, merged);
            })
        );
    }
}
