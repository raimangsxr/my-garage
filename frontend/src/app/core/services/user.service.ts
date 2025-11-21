import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface User {
    id: number;
    email: string;
    full_name?: string;
    image_url?: string;
    is_active: boolean;
    is_superuser: boolean;
}

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users/`;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}me`).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    updateMe(data: { full_name?: string; image_url?: string }): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}me`, data).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    getAvatars(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}avatars`);
    }
}
