import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { buildApiUrl } from '../utils/api-url.util';

export interface User {
    id: number;
    email: string;
    full_name?: string;
    image_url?: string;
    is_active: boolean;
    is_superuser: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = buildApiUrl('users');

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    updateMe(data: { full_name?: string; image_url?: string }): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/me`, data).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    getAvatars(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/avatars`);
    }

    changePassword(data: { current_password: string; new_password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/me/password`, data);
    }
}
