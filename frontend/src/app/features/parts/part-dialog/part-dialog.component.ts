import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Part } from '../../../core/services/part.service';

@Component({
    selector: 'app-part-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './part-dialog.component.html',
    styleUrls: ['./part-dialog.component.scss']
})
export class PartDialogComponent {
    form: FormGroup;
    isEditMode: boolean;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PartDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Part
    ) {
        this.isEditMode = !!data.id;
        this.form = this.fb.group({
            name: [data.name || '', Validators.required],
            reference: [data.reference || ''],
            price: [data.price || 0, [Validators.required, Validators.min(0)]],
            quantity: [data.quantity || 1, [Validators.required, Validators.min(0)]]
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
