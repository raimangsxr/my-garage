import { Injectable, inject } from '@angular/core';
import {
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarRef,
    TextOnlySnackBar
} from '@angular/material/snack-bar';

export type ToastTone = 'success' | 'warning' | 'info' | 'error';

export interface ToastOptions extends Omit<MatSnackBarConfig, 'horizontalPosition' | 'verticalPosition' | 'panelClass'> {
    action?: string;
    panelClass?: string[];
    tone?: ToastTone;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly snackBar = inject(MatSnackBar);

    open(message: string, options: ToastOptions = {}): MatSnackBarRef<TextOnlySnackBar> {
        const {
            action = 'Close',
            duration = 3000,
            panelClass = [],
            tone,
            ...config
        } = options;

        const toneClass = tone ? [`${tone}-snackbar`] : [];

        return this.snackBar.open(message, action, {
            ...config,
            duration,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: [...toneClass, ...panelClass]
        });
    }

    success(message: string, options: Omit<ToastOptions, 'tone'> = {}): MatSnackBarRef<TextOnlySnackBar> {
        return this.open(message, {
            ...options,
            tone: 'success'
        });
    }

    warning(message: string, options: Omit<ToastOptions, 'tone'> = {}): MatSnackBarRef<TextOnlySnackBar> {
        return this.open(message, {
            ...options,
            tone: 'warning'
        });
    }

    info(message: string, options: Omit<ToastOptions, 'tone'> = {}): MatSnackBarRef<TextOnlySnackBar> {
        return this.open(message, {
            ...options,
            tone: 'info'
        });
    }

    error(message: string, options: Omit<ToastOptions, 'tone'> = {}): MatSnackBarRef<TextOnlySnackBar> {
        return this.open(message, {
            ...options,
            tone: 'error'
        });
    }
}
