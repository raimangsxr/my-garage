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
import { Maintenance } from '../../../core/services/maintenance.service';
import { Vehicle } from '../../../core/services/vehicle.service';

export interface MaintenanceDialogData {
    maintenance: Maintenance;
    vehicles: Vehicle[];
}

@Component({
    selector: 'app-maintenance-dialog',
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
    templateUrl: './maintenance-dialog.component.html',
    styleUrls: ['./maintenance-dialog.component.scss']
})
export class MaintenanceDialogComponent {
    form: FormGroup;
    isEditMode: boolean;
    vehicles: Vehicle[];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<MaintenanceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MaintenanceDialogData
    ) {
        this.isEditMode = !!data.maintenance.id;
        this.vehicles = data.vehicles;

        this.form = this.fb.group({
            vehicle_id: [data.maintenance.vehicle_id, Validators.required],
            date: [data.maintenance.date || new Date(), Validators.required],
            description: [data.maintenance.description || '', Validators.required],
            mileage: [data.maintenance.mileage || 0, [Validators.required, Validators.min(0)]],
            cost: [data.maintenance.cost || 0, [Validators.required, Validators.min(0)]]
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
