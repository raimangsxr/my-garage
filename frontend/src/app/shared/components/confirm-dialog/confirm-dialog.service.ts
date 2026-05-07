import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmDialogService {
    private dialog = inject(MatDialog);

    confirm(data: ConfirmDialogData): Observable<boolean> {
        return this.dialog.open(ConfirmDialogComponent, {
            width: 'min(520px, calc(100vw - 32px))',
            maxWidth: 'calc(100vw - 32px)',
            autoFocus: 'dialog',
            restoreFocus: true,
            data
        }).afterClosed().pipe(
            map(result => result === true)
        );
    }
}
