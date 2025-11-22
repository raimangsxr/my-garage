import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Part } from '../../../core/services/part.service';
import { Supplier } from '../../../core/services/supplier.service';
import { Invoice } from '../../../core/services/invoice.service';
import { Maintenance } from '../../../core/services/maintenance.service';

export interface PartDialogData {
    part: Part;
    suppliers: Supplier[];
    invoices: Invoice[];
    maintenances: Maintenance[];
    readOnly?: boolean;
}

@Component({
    selector: 'app-part-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './part-dialog.component.html',
    styleUrls: ['./part-dialog.component.scss']
})
export class PartDialogComponent {
    form: FormGroup;
    isEditMode: boolean;
    suppliers: Supplier[] = [];
    invoices: Invoice[] = [];
    maintenances: Maintenance[] = [];
    readOnly: boolean = false;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PartDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PartDialogData
    ) {
        this.isEditMode = !!data.part.id;
        this.suppliers = data.suppliers || [];
        this.invoices = data.invoices || [];
        this.maintenances = data.maintenances || [];
        this.readOnly = data.readOnly || false;

        this.form = this.fb.group({
            name: [{ value: data.part.name || '', disabled: this.readOnly }, Validators.required],
            reference: [{ value: data.part.reference || '', disabled: this.readOnly }],
            price: [{ value: data.part.price || 0, disabled: this.readOnly }, [Validators.required, Validators.min(0)]],
            quantity: [{ value: data.part.quantity || 1, disabled: this.readOnly }, [Validators.required, Validators.min(0)]],
            supplier_id: [{ value: data.part.supplier_id, disabled: this.readOnly }],
            invoice_id: [{ value: data.part.invoice_id, disabled: this.readOnly }],
            maintenance_id: [{ value: data.part.maintenance_id, disabled: this.readOnly || !!data.part.maintenance_id }]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.form.valid) {
            // Use getRawValue to include disabled fields
            this.dialogRef.close(this.form.getRawValue());
        }
    }
}
