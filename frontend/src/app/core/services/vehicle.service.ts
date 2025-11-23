import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehicle {
    id?: number;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    image_url?: string;
    next_itv_date?: string;
    next_insurance_date?: string;
    last_insurance_amount?: number;
    next_road_tax_date?: string;
    last_road_tax_amount?: number;
    specs?: {
        vin?: string;
        color?: string;
        color_code?: string;
        engine_type?: string;
        fuel_type?: string;
        transmission?: string;
        engine_oil_type?: string;
        coolant_type?: string;
        battery_type?: string;
        tire_size?: string;
    };
}

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/vehicles/`;

    getVehicles(): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(this.apiUrl);
    }

    createVehicle(vehicle: Vehicle): Observable<Vehicle> {
        return this.http.post<Vehicle>(this.apiUrl, vehicle);
    }

    updateVehicle(id: number, vehicle: Vehicle): Observable<Vehicle> {
        return this.http.put<Vehicle>(`${this.apiUrl}${id}`, vehicle);
    }

    deleteVehicle(id: number): Observable<Vehicle> {
        return this.http.delete<Vehicle>(`${this.apiUrl}${id}`);
    }

    uploadImage(id: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}${id}/image`, formData);
    }

    getVehicleDetails(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}${id}/details`);
    }

    updateTorqueSpecs(id: number, specs: any[]): Observable<any> {
        return this.http.put(`${this.apiUrl}${id}/specs/torque`, specs);
    }
}
