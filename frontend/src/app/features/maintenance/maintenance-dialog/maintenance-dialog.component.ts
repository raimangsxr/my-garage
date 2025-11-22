import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Maintenance, MaintenanceService } from '../../../core/services/maintenance.service';
import { PartService } from '../../../core/services/part.service';
import { Vehicle } from '../../../core/services/vehicle.service';
import { Supplier } from '../../../core/services/supplier.service';
import { Part } from '../../../core/services/part.service';
import { Invoice } from '../../../core/services/invoice.service';
import { PartDialogComponent } from '../../parts/part-dialog/part-dialog.component';

export interface MaintenanceDialogData {
    maintenance: Maintenance;
    vehicles: Vehicle[];
    suppliers: Supplier[];
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
        MatNativeDateModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './maintenance-dialog.component.html',
    styleUrls: ['./maintenance-dialog.component.scss']
})
export class MaintenanceDialogComponent {
    form: FormGroup;
    isEditMode: boolean;
    vehicles: Vehicle[];
    suppliers: Supplier[];

    parts: Part[] = [];
    invoices: Invoice[] = [];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<MaintenanceDialogComponent>,
        private dialog: MatDialog,
        private maintenanceService: MaintenanceService,
        private partService: PartService,
        @Inject(MAT_DIALOG_DATA) public data: MaintenanceDialogData
    ) {
        this.isEditMode = !!data.maintenance.id;
        this.vehicles = data.vehicles;
        this.suppliers = data.suppliers || [];

        // Initialize parts and invoices from maintenance data
        this.parts = data.maintenance.parts || [];
        this.invoices = data.maintenance.invoices || [];

        this.form = this.fb.group({
            vehicle_id: [{ value: data.maintenance.vehicle_id, disabled: !!data.maintenance.vehicle_id }, Validators.required],
            date: [data.maintenance.date ? new Date(data.maintenance.date) : new Date(), Validators.required],
            description: [data.maintenance.description || '', Validators.required],
            mileage: [data.maintenance.mileage || 0, [Validators.required, Validators.min(0)]],
            cost: [data.maintenance.cost || 0, [Validators.required, Validators.min(0)]],
            supplier_id: [data.maintenance.supplier_id]
        });

        // Load fresh data from server in edit mode to ensure we have the latest parts and invoices
        if (this.isEditMode && data.maintenance.id) {
            this.refreshMaintenanceData();
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.form.valid) {
            const formValue = this.form.value;
            // Convert date to ISO string (YYYY-MM-DD)
            if (formValue.date instanceof Date) {
                formValue.date = formValue.date.toISOString().split('T')[0];
            }
            this.dialogRef.close(formValue);
        }
    }

    addPart(): void {
        if (!this.isEditMode || !this.data.maintenance.id) return;

        const dialogRef = this.dialog.open(PartDialogComponent, {
            width: '400px',
            data: {
                part: { maintenance_id: this.data.maintenance.id },
                suppliers: this.suppliers,
                invoices: this.invoices,
                maintenances: [this.data.maintenance]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Create the part first
                this.partService.createPart(result).subscribe({
                    next: () => {
                        // Then refresh maintenance data to show new part
                        this.refreshMaintenanceData();
                    },
                    error: (err) => {
                        console.error('Error creating part', err);
                    }
                });
            }
        });
    }

    private refreshMaintenanceData(): void {
        if (this.data.maintenance.id) {
            this.maintenanceService.getMaintenance(this.data.maintenance.id).subscribe({
                next: (maintenance) => {
                    console.log('Refreshed maintenance data:', maintenance);
                    console.log('Parts count:', maintenance.parts?.length || 0);
                    this.data.maintenance = maintenance;
                    this.parts = maintenance.parts || [];
                    this.invoices = maintenance.invoices || [];
                },
                error: (err) => {
                    console.error('Error refreshing maintenance data', err);
                }
            });
        }
    }

    deletePart(partId: number): void {
        if (confirm('Are you sure you want to delete this part?')) {
            this.partService.deletePart(partId).subscribe({
                next: () => {
                    this.refreshMaintenanceData();
                },
                error: (err) => {
                    console.error('Error deleting part', err);
                }
            });
        }
    }
}
