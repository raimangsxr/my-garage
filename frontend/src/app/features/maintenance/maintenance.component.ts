import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MaintenanceService, Maintenance } from '../../core/services/maintenance.service';
import { VehicleService, Vehicle } from '../../core/services/vehicle.service';
import { Supplier, SupplierService } from '../../core/services/supplier.service';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';

interface VehicleMaintenanceGroup {
    vehicle: Vehicle;
    maintenances: Maintenance[];
}

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatMenuModule
    ],
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
    private maintenanceService = inject(MaintenanceService);
    private vehicleService = inject(VehicleService);
    private supplierService = inject(SupplierService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    maintenances: Maintenance[] = [];
    vehicles: Vehicle[] = [];
    suppliers: Supplier[] = [];
    groupedMaintenances: VehicleMaintenanceGroup[] = [];

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.vehicleService.getVehicles().subscribe({
            next: (vehicles) => {
                this.vehicles = vehicles;
                this.loadMaintenances();
                this.loadSuppliers();
            },
            error: (err) => {
                console.error('Error loading vehicles', err);
                this.showSnackBar('Error loading vehicles');
            }
        });
    }

    loadSuppliers(): void {
        this.supplierService.getSuppliers().subscribe({
            next: (suppliers) => {
                this.suppliers = suppliers;
            },
            error: (err) => {
                console.error('Error loading suppliers', err);
            }
        });
    }

    loadMaintenances(): void {
        this.maintenanceService.getMaintenances().subscribe({
            next: (data) => {
                this.maintenances = data;
                this.groupMaintenancesByVehicle();
            },
            error: (err) => {
                console.error('Error loading maintenances', err);
                this.showSnackBar('Error loading maintenances');
            }
        });
    }

    groupMaintenancesByVehicle(): void {
        this.groupedMaintenances = this.vehicles
            .map(vehicle => ({
                vehicle,
                maintenances: this.maintenances
                    .filter(m => m.vehicle_id === vehicle.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }))
            .filter(group => group.maintenances.length > 0);
    }

    getVehicleName(vehicleId?: number): string {
        if (!vehicleId) return '-';
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})` : 'Unknown Vehicle';
    }

    getDaysSince(dateStr: string): number {
        const date = new Date(dateStr);
        const today = new Date();
        const diffTime = today.getTime() - date.getTime();
        return Math.floor(diffTime / (1000 * 3600 * 24));
    }

    getDateBadgeClass(dateStr: string): string {
        const days = this.getDaysSince(dateStr);
        if (days <= 30) return 'recent';
        if (days <= 90) return 'moderate';
        return 'old';
    }

    openMaintenanceDialog(maintenance?: Maintenance): void {
        const dialogRef = this.dialog.open(MaintenanceDialogComponent, {
            width: '500px',
            data: {
                maintenance: maintenance || {},
                vehicles: this.vehicles,
                suppliers: this.suppliers
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (maintenance && maintenance.id) {
                    this.updateMaintenance(maintenance.id, result);
                } else {
                    this.createMaintenance(result);
                }
            }
        });
    }

    createMaintenance(maintenance: Maintenance): void {
        this.maintenanceService.createMaintenance(maintenance).subscribe({
            next: () => {
                this.loadMaintenances();
                this.showSnackBar('Maintenance record created successfully');
            },
            error: (err) => {
                console.error('Error creating maintenance', err);
                this.showSnackBar('Error creating maintenance');
            }
        });
    }

    updateMaintenance(id: number, maintenance: Maintenance): void {
        this.maintenanceService.updateMaintenance(id, maintenance).subscribe({
            next: () => {
                this.loadMaintenances();
                this.showSnackBar('Maintenance record updated successfully');
            },
            error: (err) => {
                console.error('Error updating maintenance', err);
                this.showSnackBar('Error updating maintenance');
            }
        });
    }

    deleteMaintenance(id: number): void {
        if (confirm('Are you sure you want to delete this maintenance record?')) {
            this.maintenanceService.deleteMaintenance(id).subscribe({
                next: () => {
                    this.loadMaintenances();
                    this.showSnackBar('Maintenance record deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting maintenance', err);
                    this.showSnackBar('Error deleting maintenance');
                }
            });
        }
    }

    private showSnackBar(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
        });
    }
}
