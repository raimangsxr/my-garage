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
import { MatExpansionModule } from '@angular/material/expansion';
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
        MatNativeDateModule,
        MatSelectModule,
        MatExpansionModule
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
            last_road_tax_amount: [this.data?.last_road_tax_amount || ''],
            specs: this.fb.group({
                vin: [this.data?.specs?.vin || ''],
                color: [this.data?.specs?.color || ''],
                color_code: [this.data?.specs?.color_code || ''],
                engine_type: [this.data?.specs?.engine_type || ''],
                fuel_type: [this.data?.specs?.fuel_type || ''],
                transmission: [this.data?.specs?.transmission || ''],
                engine_oil_type: [this.data?.specs?.engine_oil_type || ''],
                coolant_type: [this.data?.specs?.coolant_type || ''],
                battery_type: [this.data?.specs?.battery_type || ''],
                tire_size: [this.data?.specs?.tire_size || '']
            })
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

    private formatDate(date: Date | string | null): string | null {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        // Use local time components to preserve the selected date
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.value;

            // Convert empty strings to null for optional fields and format dates
            const vehicleData = {
                ...formValue,
                year: Number(formValue.year),
                next_itv_date: this.formatDate(formValue.next_itv_date),
                next_insurance_date: this.formatDate(formValue.next_insurance_date),
                last_insurance_amount: formValue.last_insurance_amount ? Number(formValue.last_insurance_amount) : null,
                next_road_tax_date: this.formatDate(formValue.next_road_tax_date),
                last_road_tax_amount: formValue.last_road_tax_amount ? Number(formValue.last_road_tax_amount) : null,
                // Specs are already in formValue.specs, but we should clean empty strings to null if needed
                // For now, sending as is (empty strings) is usually fine, or we can clean them up
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
