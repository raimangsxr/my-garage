import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrganizerService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/organizers`;

    getOrganizers(): Observable<string[]> {
        return this.http.get<string[]>(this.apiUrl);
    }
}
