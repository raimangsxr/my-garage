import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const isAuthEndpoint =
        req.url.includes('/auth/login/access-token') ||
        req.url.includes('/auth/google/login');

    if (isAuthEndpoint) {
        return next(req);
    }

    const rawToken = localStorage.getItem('access_token');
    const token = rawToken?.trim().startsWith('Bearer ')
        ? rawToken.trim().slice(7).trim()
        : rawToken?.trim();

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};
