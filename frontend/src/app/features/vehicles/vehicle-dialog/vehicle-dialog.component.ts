import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { VehicleService, Vehicle } from '../../../core/services/vehicle.service';

@Component({
    selector: 'app-vehicle-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './vehicle-dialog.component.html',
    styleUrls: ['./vehicle-dialog.component.scss']
})
export class VehicleDialogComponent {
    private fb = inject(FormBuilder);
    private dialogRef = inject(MatDialogRef<VehicleDialogComponent>);
    private data: Vehicle | undefined = inject(MAT_DIALOG_DATA);
    private vehicleService = inject(VehicleService);

    form: FormGroup;
    isEditMode = false;

    constructor() {
        this.isEditMode = !!this.data;
        this.form = this.fb.group({
            brand: [this.data?.brand || '', Validators.required],
            model: [this.data?.model || '', Validators.required],
            year: [this.data?.year || new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
            license_plate: [this.data?.license_plate || '', Validators.required],
            image_url: [this.data?.image_url || ''],
            next_itv_date: [this.data?.next_itv_date || ''],
            next_insurance_date: [this.data?.next_insurance_date || ''],
            last_insurance_amount: [this.data?.last_insurance_amount || ''],
            next_road_tax_date: [this.data?.next_road_tax_date || ''],
            last_road_tax_amount: [this.data?.last_road_tax_amount || '']
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.value;

            // Convert empty strings to null for optional fields
            const vehicleData = {
                ...formValue,
                image_url: formValue.image_url || null,
                next_itv_date: formValue.next_itv_date || null,
                next_insurance_date: formValue.next_insurance_date || null,
                last_insurance_amount: formValue.last_insurance_amount || null,
                next_road_tax_date: formValue.next_road_tax_date || null,
                last_road_tax_amount: formValue.last_road_tax_amount || null
            };

            if (this.isEditMode && this.data?.id) {
                this.vehicleService.updateVehicle(this.data.id, vehicleData).subscribe(result => {
                    this.dialogRef.close(result);
                });
            } else {
                this.vehicleService.createVehicle(vehicleData).subscribe(result => {
                    this.dialogRef.close(result);
                });
            }
        }
    }
}
