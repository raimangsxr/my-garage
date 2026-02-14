import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TrackSummary, TrackDetail } from './tracks.models';
import { buildApiUrl } from '../../core/utils/api-url.util';
import { PaginatedResponse, normalizePaginated } from '../../core/models/paginated.model';

export interface TrackPageOptions {
    skip?: number;
    limit?: number;
    q?: string;
    onlyActive?: boolean;
    sortBy?: 'name' | 'location' | 'length_meters' | 'total_sessions' | 'best_lap_time' | 'vehicle_count' | 'last_session_date' | 'id';
    sortDir?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class TracksService {
    private http = inject(HttpClient);
    private apiUrl = buildApiUrl('tracks');

    getTracksPage(options: TrackPageOptions = {}): Observable<PaginatedResponse<TrackSummary>> {
        const skip = options.skip ?? 0;
        const limit = options.limit ?? 100;
        let params = new HttpParams()
            .set('skip', skip)
            .set('limit', limit);

        if (options.q?.trim()) {
            params = params.set('q', options.q.trim());
        }
        if (options.onlyActive !== undefined) {
            params = params.set('only_active', String(options.onlyActive));
        }
        if (options.sortBy) {
            params = params.set('sort_by', options.sortBy);
        }
        if (options.sortDir) {
            params = params.set('sort_dir', options.sortDir);
        }

        return this.http.get<TrackSummary[] | PaginatedResponse<TrackSummary>>(this.apiUrl, { params }).pipe(
            map(response => normalizePaginated(response, skip, limit))
        );
    }

    getTracks(): Observable<TrackSummary[]> {
        return this.getTracksPage({ skip: 0, limit: 200 }).pipe(
            map(page => page.items)
        );
    }

    getTrackDetail(trackId: number): Observable<TrackDetail> {
        return this.http.get<TrackDetail>(`${this.apiUrl}/${trackId}`);
    }
}
