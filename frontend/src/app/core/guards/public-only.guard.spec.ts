import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicOnlyGuard } from './public-only.guard';

describe('PublicOnlyGuard', () => {
    let authService: { getToken: ReturnType<typeof vi.fn> };
    let router: { createUrlTree: ReturnType<typeof vi.fn> };
    let guard: PublicOnlyGuard;

    beforeEach(() => {
        authService = {
            getToken: vi.fn(),
        };
        router = {
            createUrlTree: vi.fn().mockReturnValue('/dashboard-tree' as any),
        };
        guard = new PublicOnlyGuard(authService as any, router as unknown as Router);
    });

    it('allows public access when no token is present', () => {
        authService.getToken.mockReturnValue(null);

        expect(guard.canActivate()).toBe(true);
        expect(guard.canMatch({} as any, [])).toBe(true);
    });

    it('redirects authenticated visitors to the dashboard tree', () => {
        authService.getToken.mockReturnValue('token');

        expect(guard.canActivate()).toBe('/dashboard-tree');
        expect(guard.canMatch({} as any, [])).toBe('/dashboard-tree');
        expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });
});
