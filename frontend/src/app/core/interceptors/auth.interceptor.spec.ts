import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
    let authService: { getToken: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authService = {
            getToken: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
            ],
        });
    });

    it('does not attach an authorization header to auth endpoints', async () => {
        authService.getToken.mockReturnValue('token-123');
        const req = new HttpRequest('POST', '/api/v1/auth/login/access-token', null);
        const next = vi.fn((forwarded: HttpRequest<unknown>) => {
            expect(forwarded.headers.has('Authorization')).toBe(false);
            return of(new HttpResponse({ status: 200 }));
        });

        await TestBed.runInInjectionContext(async () => {
            await lastValueFrom(authInterceptor(req, next));
        });

        expect(next).toHaveBeenCalledOnce();
        expect(authService.getToken).not.toHaveBeenCalled();
    });

    it('attaches a normalized bearer token to non-auth endpoints', async () => {
        authService.getToken.mockReturnValue('token-456');
        const req = new HttpRequest('GET', '/api/v1/vehicles');
        const next = vi.fn((forwarded: HttpRequest<unknown>) => {
            expect(forwarded.headers.get('Authorization')).toBe('Bearer token-456');
            return of(new HttpResponse({ status: 200 }));
        });

        await TestBed.runInInjectionContext(async () => {
            await lastValueFrom(authInterceptor(req, next));
        });

        expect(next).toHaveBeenCalledOnce();
        expect(authService.getToken).toHaveBeenCalledOnce();
    });
});
