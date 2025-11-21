import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Invoice } from '../../../core/services/invoice.service';
import { Maintenance } from '../../../core/services/maintenance.service';

export interface InvoiceDialogData {
    invoice: Invoice;
    maintenances: Maintenance[];
}

@Component({
    selector: 'app-invoice-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './invoice-dialog.component.html',
    styleUrls: ['./invoice-dialog.component.scss']
})
export class InvoiceDialogComponent {
    form: FormGroup;
    isEditMode: boolean;
    maintenances: Maintenance[];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<InvoiceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: InvoiceDialogData
    ) {
        this.isEditMode = !!data.invoice.id;
        this.maintenances = data.maintenances;

        this.form = this.fb.group({
            number: [data.invoice.number || '', Validators.required],
            date: [data.invoice.date || new Date(), Validators.required],
            amount: [data.invoice.amount || 0, [Validators.required, Validators.min(0)]],
            maintenance_id: [data.invoice.maintenance_id],
            file_url: [data.invoice.file_url || '']
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        }
    }
}
