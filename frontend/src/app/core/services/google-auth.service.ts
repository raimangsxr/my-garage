import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

declare global {
    interface Window {
        google: any;
    }
}

export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture: string;
}

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService {
    private userSubject = new BehaviorSubject<GoogleUser | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(
        private http: HttpClient,
        private ngZone: NgZone,
        private authService: AuthService
    ) {
        this.loadStoredSession();
    }

    private loadStoredSession() {
        const token = this.authService.getToken();
        const userStr = localStorage.getItem('google_user');

        if (token && userStr) {
            this.userSubject.next(JSON.parse(userStr));
        }
    }

    initializeGoogleSignIn(buttonElementId: string) {
        if (!window.google) {
            console.error('Google Identity Services script not loaded');
            return;
        }

        window.google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (response: any) => this.handleCredentialResponse(response),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
            document.getElementById(buttonElementId),
            { theme: 'outline', size: 'large', width: '100%' }
        );
    }

    private handleCredentialResponse(response: any) {
        this.ngZone.run(() => {
            console.log('Google Auth Response:', response);

            // Send token to backend for validation and session
            this.http.post<any>(`${environment.apiUrl}/auth/google/login`, {
                credential: response.credential
            }).subscribe({
                next: (res) => {
                    const user = res.user;
                    const token = res.access_token; // Token de la app (JWT)

                    // Save session
                    this.authService.setToken(token);
                    localStorage.setItem('google_user', JSON.stringify(user));

                    // Actualizar estado
                    this.userSubject.next(user);
                },
                error: (err) => {
                    console.error('Google login failed', err);
                }
            });
        });
    }

    signOut() {
        window.google?.accounts?.id?.disableAutoSelect();
        this.authService.logout();
        localStorage.removeItem('google_user');
        this.userSubject.next(null);
    }

    isAuthenticated(): boolean {
        return !!this.authService.getToken();
    }

    getToken(): string | null {
        return this.authService.getToken();
    }
}
