import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
    let authState$: BehaviorSubject<boolean>;
    let router: { createUrlTree: ReturnType<typeof vi.fn> };
    let guard: AuthGuard;

    beforeEach(() => {
        authState$ = new BehaviorSubject(false);
        router = {
            createUrlTree: vi.fn().mockReturnValue('/login-tree' as any),
        };

        guard = new AuthGuard({ isAuthenticated$: authState$.asObservable() } as any, router as unknown as Router);
    });

    it('allows activation when the current auth state is true', async () => {
        authState$.next(true);

        const result = await firstValueFrom(guard.canActivate());

        expect(result).toBe(true);
        expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('redirects to the login tree when the current auth state is false', async () => {
        const result = await firstValueFrom(guard.canActivate());

        expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
        expect(result).toBe('/login-tree');
    });
});
