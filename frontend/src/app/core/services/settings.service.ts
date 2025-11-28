import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Settings, SettingsUpdate } from '../models/settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/settings/`;

    private settingsSubject = new BehaviorSubject<Settings | null>(null);
    settings$ = this.settingsSubject.asObservable();

    getSettings(): Observable<Settings> {
        return this.http.get<Settings>(this.apiUrl).pipe(
            tap(settings => this.settingsSubject.next(settings))
        );
    }

    updateSettings(settings: SettingsUpdate): Observable<Settings> {
        return this.http.put<Settings>(this.apiUrl, settings).pipe(
            tap(updatedSettings => this.settingsSubject.next(updatedSettings))
        );
    }
}
