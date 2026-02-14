import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/utils/api-url.util';

@Injectable({
    providedIn: 'root'
})
export class OrganizerService {
    private http = inject(HttpClient);
    private apiUrl = buildApiUrl('organizers');

    getOrganizers(): Observable<string[]> {
        return this.http.get<string[]>(this.apiUrl);
    }
}
