import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { fromEvent, interval, merge, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LoggerService } from './logger.service';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private readonly updates = inject(SwUpdate);
    private readonly snackBar = inject(MatSnackBar);
    private readonly logger = inject(LoggerService);
    private readonly document = inject(DOCUMENT);

    private readonly subscriptions = new Subscription();
    private updatePromptShown = false;
    private currentConnectivityState: 'online' | 'offline' | null = null;
    private initialized = false;

    init(): void {
        if (this.initialized || typeof window === 'undefined') {
            return;
        }

        this.initialized = true;
        this.watchConnectivity();
        this.watchForUpdates();
    }

    destroy(): void {
        this.subscriptions.unsubscribe();
    }

    private watchConnectivity(): void {
        const offline$ = fromEvent(window, 'offline');
        const online$ = fromEvent(window, 'online');

        this.subscriptions.add(
            merge(offline$, online$).subscribe(() => {
                const nextState = navigator.onLine ? 'online' : 'offline';
                if (nextState === this.currentConnectivityState) {
                    return;
                }

                this.currentConnectivityState = nextState;
                const isOffline = nextState === 'offline';

                this.snackBar.open(
                    isOffline
                        ? 'You are offline. Cached screens remain available.'
                        : 'Connection restored.',
                    'Close',
                    {
                        duration: isOffline ? 5000 : 3000,
                        panelClass: [isOffline ? 'warning-snackbar' : 'success-snackbar']
                    }
                );
            })
        );
    }

    private watchForUpdates(): void {
        if (!this.updates.isEnabled) {
            return;
        }

        this.subscriptions.add(
            this.updates.versionUpdates
                .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
                .subscribe(() => this.promptForUpdate())
        );

        this.subscriptions.add(
            this.updates.unrecoverable.subscribe((event) => {
                this.logger.error('Unrecoverable service worker state', event.reason);
                const snackBarRef = this.snackBar.open(
                    'The app needs to reload to recover.',
                    'Reload'
                );
                snackBarRef.onAction().subscribe(() => this.reloadPage());
            })
        );

        this.subscriptions.add(
            interval(6 * 60 * 60 * 1000).subscribe(() => {
                this.checkForUpdate();
            })
        );

        this.checkForUpdate();
    }

    private async checkForUpdate(): Promise<void> {
        try {
            await this.updates.checkForUpdate();
        } catch (error) {
            this.logger.error('Error while checking for PWA updates', error);
        }
    }

    private promptForUpdate(): void {
        if (this.updatePromptShown) {
            return;
        }

        this.updatePromptShown = true;

        const snackBarRef = this.snackBar.open(
            'A new version of My Garage is ready.',
            'Reload',
            {
                duration: 0,
                panelClass: ['info-snackbar']
            }
        );

        snackBarRef.onAction().subscribe(async () => {
            try {
                await this.updates.activateUpdate();
            } catch (error) {
                this.logger.error('Error while activating PWA update', error);
            }

            this.reloadPage();
        });

        snackBarRef.afterDismissed().subscribe(() => {
            this.updatePromptShown = false;
        });
    }

    private reloadPage(): void {
        this.document.location.reload();
    }
}
