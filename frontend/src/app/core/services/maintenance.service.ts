import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {
    private apiUrl = `${environment.apiUrl}/maintenance/`;

    constructor(private http: HttpClient) { }

    getMaintenances(): Observable<Maintenance[]> {
        return this.http.get<Maintenance[]>(this.apiUrl);
    }

    getMaintenance(id: number): Observable<Maintenance> {
        return this.http.get<Maintenance>(`${this.apiUrl}${id}`);
    }

    createMaintenance(maintenance: Maintenance): Observable<Maintenance> {
        return this.http.post<Maintenance>(this.apiUrl, maintenance);
    }

    updateMaintenance(id: number, maintenance: Maintenance): Observable<Maintenance> {
        return this.http.put<Maintenance>(`${this.apiUrl}${id}`, maintenance);
    }

    deleteMaintenance(id: number): Observable<Maintenance> {
        return this.http.delete<Maintenance>(`${this.apiUrl}${id}`);
    }
}
