import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { buildApiUrl } from '../utils/api-url.util';
import { UserService } from './user.service';

interface LoginResponse {
    access_token: string;
    token_type: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = buildApiUrl('auth');
    private tokenKey = 'access_token';
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private http: HttpClient, private router: Router, private userService: UserService) {}

    private hasToken(): boolean {
        return !!this.getToken();
    }

    private decodeJwtPayload(token: string): { exp?: number } | null {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        try {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
            const payload = atob(padded);
            return JSON.parse(payload) as { exp?: number };
        } catch {
            return null;
        }
    }

    private normalizeToken(token: string | null): string | null {
        if (!token) {
            return null;
        }
        const trimmed = token.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
            return null;
        }
        return trimmed.startsWith('Bearer ') ? trimmed.slice(7).trim() : trimmed;
    }

    private isTokenValid(token: string): boolean {
        const payload = this.decodeJwtPayload(token);
        if (!payload?.exp) {
            return false;
        }
        const nowSeconds = Math.floor(Date.now() / 1000);
        return payload.exp > nowSeconds;
    }

    login(username: string, password: string): Observable<LoginResponse> {
        const body = new URLSearchParams();
        body.set('username', username);
        body.set('password', password);

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post<LoginResponse>(`${this.apiUrl}/login/access-token`, body.toString(), { headers }).pipe(
            switchMap(response => {
                this.setToken(response.access_token, false);
                if (!this.hasToken()) {
                    return throwError(() => new Error('Invalid token received from server'));
                }
                return this.userService.getMe().pipe(
                    tap(() => {
                        this.isAuthenticatedSubject.next(true);
                        this.router.navigate(['/']);
                    }),
                    map(() => response)
                );
            }),
            catchError((error) => {
                localStorage.removeItem(this.tokenKey);
                this.isAuthenticatedSubject.next(false);
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }

    setAuthenticatedState(isAuthenticated: boolean): void {
        this.isAuthenticatedSubject.next(isAuthenticated);
    }

    getToken(): string | null {
        const raw = localStorage.getItem(this.tokenKey);
        const token = this.normalizeToken(raw);
        if (!token || !this.isTokenValid(token)) {
            if (raw !== null) {
                localStorage.removeItem(this.tokenKey);
            }
            return null;
        }
        if (raw !== token) {
            localStorage.setItem(this.tokenKey, token);
        }
        return token;
    }

    setToken(token: string, emitAuthenticated = true): void {
        const normalized = this.normalizeToken(token);
        if (!normalized || !this.isTokenValid(normalized)) {
            this.logout();
            return;
        }
        localStorage.setItem(this.tokenKey, normalized);
        if (emitAuthenticated) {
            this.isAuthenticatedSubject.next(true);
        }
    }
}
