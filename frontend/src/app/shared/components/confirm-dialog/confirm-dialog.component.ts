import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ConfirmDialogIntent = 'danger' | 'warning' | 'info';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
    intent?: ConfirmDialogIntent;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
    private dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
    data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

    get intent(): ConfirmDialogIntent {
        return this.data.intent ?? 'danger';
    }

    get icon(): string {
        switch (this.intent) {
            case 'warning':
                return 'warning_amber';
            case 'info':
                return 'info';
            default:
                return 'delete_outline';
        }
    }

    get confirmText(): string {
        return this.data.confirmText ?? 'Confirm';
    }

    get cancelText(): string | null {
        return this.data.cancelText === undefined ? 'Cancel' : this.data.cancelText;
    }

    cancel(): void {
        this.dialogRef.close(false);
    }

    confirm(): void {
        this.dialogRef.close(true);
    }
}
