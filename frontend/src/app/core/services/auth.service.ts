import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
    access_token: string;
    token_type: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/v1/auth/'; // Base auth URL
    private tokenKey = 'access_token';
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    private hasToken(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    login(username: string, password: string): Observable<LoginResponse> {
        const body = new URLSearchParams();
        body.set('username', username);
        body.set('password', password);

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post<LoginResponse>(`${this.apiUrl}login/access-token`, body.toString(), { headers }).pipe(
            tap(response => {
                localStorage.setItem(this.tokenKey, response.access_token);
                this.isAuthenticatedSubject.next(true);
                this.router.navigate(['/']);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }
}
