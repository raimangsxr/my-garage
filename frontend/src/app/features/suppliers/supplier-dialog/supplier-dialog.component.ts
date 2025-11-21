import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Supplier } from '../../../core/services/supplier.service';

@Component({
    selector: 'app-supplier-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './supplier-dialog.component.html',
    styleUrls: ['./supplier-dialog.component.scss']
})
export class SupplierDialogComponent {
    form: FormGroup;
    isEditMode: boolean;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<SupplierDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Supplier
    ) {
        this.isEditMode = !!data.id;

        this.form = this.fb.group({
            name: [data.name || '', Validators.required],
            email: [data.email || '', [Validators.email]],
            phone: [data.phone || ''],
            address: [data.address || '']
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
