import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrackSummary, TrackDetail } from './tracks.models';

@Injectable({
    providedIn: 'root'
})
export class TracksService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tracks`;

    getTracks(): Observable<TrackSummary[]> {
        return this.http.get<TrackSummary[]>(this.apiUrl);
    }

    getTrackDetail(trackId: number): Observable<TrackDetail> {
        return this.http.get<TrackDetail>(`${this.apiUrl}/${trackId}`);
    }
}
