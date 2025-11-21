import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Maintenance {
    id?: number;
    date: string;
    description: string;
    mileage: number;
    cost: number;
    vehicle_id?: number;
    supplier_id?: number;
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
