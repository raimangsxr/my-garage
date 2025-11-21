import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Maintenance, MaintenanceService } from '../../core/services/maintenance.service';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';
import { Vehicle, VehicleService } from '../../core/services/vehicle.service';

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
        MatSnackBarModule
    ],
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
    maintenances: Maintenance[] = [];
    vehicles: Vehicle[] = [];
    displayedColumns: string[] = ['date', 'vehicle', 'description', 'mileage', 'cost', 'actions'];

    constructor(
        private maintenanceService: MaintenanceService,
        private vehicleService: VehicleService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.vehicleService.getVehicles().subscribe({
            next: (vehicles) => {
                this.vehicles = vehicles;
                this.loadMaintenances();
            },
            error: (err) => {
                console.error('Error loading vehicles', err);
                this.showSnackBar('Error loading vehicles');
            }
        });
    }

    loadMaintenances(): void {
        this.maintenanceService.getMaintenances().subscribe({
            next: (data) => {
                this.maintenances = data;
            },
            error: (err) => {
                console.error('Error loading maintenances', err);
                this.showSnackBar('Error loading maintenances');
            }
        });
    }

    getVehicleName(vehicleId?: number): string {
        if (!vehicleId) return '-';
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})` : 'Unknown Vehicle';
    }

    openMaintenanceDialog(maintenance?: Maintenance): void {
        const dialogRef = this.dialog.open(MaintenanceDialogComponent, {
            width: '500px',
            data: { maintenance: maintenance || {}, vehicles: this.vehicles }
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
            duration: 3000
        });
    }
}
