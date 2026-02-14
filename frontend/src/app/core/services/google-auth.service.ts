import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { buildApiUrl } from '../utils/api-url.util';

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

    private http = inject(HttpClient);
    private ngZone = inject(NgZone);
    private authService = inject(AuthService);
    private logger = inject(LoggerService);
    private googleLoginUrl = buildApiUrl('auth/google/login');

    constructor() {
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
            this.logger.error('Google Identity Services script not loaded');
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
            this.logger.debug('Google Auth Response received');

            // Send token to backend for validation and session
            this.http.post<any>(this.googleLoginUrl, {
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
                    this.logger.error('Google login failed', err);
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
