import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Part {
    id?: number;
    name: string;
    reference?: string;
    price: number;
    quantity: number;
    maintenance_id?: number;
}

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PartService {
    private apiUrl = `${environment.apiUrl}/parts/`;

    constructor(private http: HttpClient) { }

    getParts(): Observable<Part[]> {
        return this.http.get<Part[]>(this.apiUrl);
    }

    createPart(part: Part): Observable<Part> {
        return this.http.post<Part>(this.apiUrl, part);
    }

    updatePart(id: number, part: Part): Observable<Part> {
        return this.http.put<Part>(`${this.apiUrl}${id}`, part);
    }

    deletePart(id: number): Observable<Part> {
        return this.http.delete<Part>(`${this.apiUrl}${id}`);
    }
}
