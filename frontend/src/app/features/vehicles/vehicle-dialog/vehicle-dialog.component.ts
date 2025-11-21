import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { VehicleService, Vehicle } from '../../../core/services/vehicle.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-vehicle-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule
    ],
    templateUrl: './vehicle-dialog.component.html',
    styleUrls: ['./vehicle-dialog.component.scss']
})
export class VehicleDialogComponent {
    private fb = inject(FormBuilder);
    private dialogRef = inject(MatDialogRef<VehicleDialogComponent>);
    private data: Vehicle | undefined = inject(MAT_DIALOG_DATA);
    private vehicleService = inject(VehicleService);
    private http = inject(HttpClient);

    form: FormGroup;
    isEditMode = false;
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    imageSource: 'file' | 'url' = 'url';
    imageUrl: string = '';

    constructor() {
        this.isEditMode = !!this.data;
        this.form = this.fb.group({
            brand: [this.data?.brand || '', Validators.required],
            model: [this.data?.model || '', Validators.required],
            year: [this.data?.year || new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
            license_plate: [this.data?.license_plate || '', Validators.required],
            next_itv_date: [this.data?.next_itv_date || ''],
            next_insurance_date: [this.data?.next_insurance_date || ''],
            last_insurance_amount: [this.data?.last_insurance_amount || ''],
            next_road_tax_date: [this.data?.next_road_tax_date || ''],
            last_road_tax_amount: [this.data?.last_road_tax_amount || '']
        });

        if (this.data?.image_url) {
            this.imagePreview = this.data.image_url;
        }
    }

    onImageSourceChange() {
        this.selectedFile = null;
        this.imagePreview = null;
        this.imageUrl = '';
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    loadImageFromUrl() {
        if (!this.imageUrl) return;

        // Use backend proxy to avoid CORS issues
        const proxyUrl = `${this.vehicleService['apiUrl']}proxy-image?url=${encodeURIComponent(this.imageUrl)}`;

        this.http.get(proxyUrl, { responseType: 'blob' }).subscribe({
            next: (blob) => {
                const file = new File([blob], 'vehicle-image.jpg', { type: blob.type });
                this.selectedFile = file;

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.imagePreview = e.target.result;
                };
                reader.readAsDataURL(file);
            },
            error: (err) => {
                console.error('Error loading image from URL', err);
                alert('Error loading image from URL. Please check the URL and try again.');
            }
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.value;

            // Convert empty strings to null for optional fields
            const vehicleData = {
                ...formValue,
                next_itv_date: formValue.next_itv_date || null,
                next_insurance_date: formValue.next_insurance_date || null,
                last_insurance_amount: formValue.last_insurance_amount || null,
                next_road_tax_date: formValue.next_road_tax_date || null,
                last_road_tax_amount: formValue.last_road_tax_amount || null
            };

            const handleVehicleResponse = (result: Vehicle) => {
                if (this.selectedFile && result.id) {
                    this.vehicleService.uploadImage(result.id, this.selectedFile).subscribe({
                        next: () => this.dialogRef.close(result),
                        error: () => this.dialogRef.close(result)
                    });
                } else {
                    this.dialogRef.close(result);
                }
            };

            if (this.isEditMode && this.data?.id) {
                this.vehicleService.updateVehicle(this.data.id, vehicleData).subscribe(handleVehicleResponse);
            } else {
                this.vehicleService.createVehicle(vehicleData).subscribe(handleVehicleResponse);
            }
        }
    }
}
