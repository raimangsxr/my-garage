import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);
    const authService = inject(AuthService);
    const logger = inject(LoggerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An error occurred';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Client Error: ${error.error.message}`;
                logger.error('Client-side error', error.error);
            } else {
                // Server-side error
                logger.error(`HTTP Error ${error.status}`, {
                    url: error.url,
                    status: error.status,
                    message: error.message,
                    body: error.error
                });

                // Provide user-friendly messages for common errors
                switch (error.status) {
                    case 0:
                        errorMessage = 'Unable to connect to server. Please check your connection.';
                        break;
                    case 401:
                        authService.logout();
                        errorMessage = 'Session expired. Please login again.';
                        break;
                    case 403:
                        errorMessage = 'You do not have permission to perform this action.';
                        break;
                    case 404:
                        errorMessage = 'Resource not found.';
                        break;
                    case 500:
                        errorMessage = 'Internal server error. Please try again later.';
                        break;
                    default:
                        errorMessage = error.error?.detail || `Error: ${error.status}`;
                }
            }

            // Show error to user (except for requests marked as silent)
            if (!req.headers.has('X-Silent-Error')) {
                snackBar.open(errorMessage, 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar']
                });
            }

            return throwError(() => error);
        })
    );
};
