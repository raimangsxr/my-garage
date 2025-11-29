import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
    total_vehicles: number;
    scheduled_maintenance: number;
    total_spent: number;
    total_suppliers: number;
    recent_activity: RecentActivity[];
    monthly_costs: MonthlyCost[];
    circuit_summary: CircuitSummary;
}

export interface RecentActivity {
    id: number;
    date: string;
    vehicle_name: string;
    description: string;
    cost: number;
    mileage: number;
}

export interface MonthlyCost {
    month: string;
    cost: number;
}

export interface CircuitBestTime {
    circuit_name: string;
    best_time: string;
}

export interface CircuitSummary {
    total_circuits: number;
    best_times_per_circuit: CircuitBestTime[];
    total_track_days: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
    }
}
