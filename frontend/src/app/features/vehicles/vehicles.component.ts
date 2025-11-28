import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService, Vehicle } from '../../core/services/vehicle.service';
import { VehicleDialogComponent } from './vehicle-dialog/vehicle-dialog.component';

@Component({
    selector: 'app-vehicles',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './vehicles.component.html',
    styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
    private vehicleService = inject(VehicleService);
    private dialog = inject(MatDialog);
    private router = inject(Router);

    vehicles: Vehicle[] = [];
    isLoading = false;

    ngOnInit() {
        this.loadVehicles();
    }

    loadVehicles() {
        this.isLoading = true;
        this.vehicleService.getVehicles().subscribe({
            next: (vehicles) => {
                this.vehicles = vehicles;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading vehicles', error);
                this.isLoading = false;
            }
        });
    }

    viewVehicleDetails(id: number) {
        this.router.navigate(['/vehicles', id]);
    }

    openVehicleDialog(vehicle?: Vehicle) {
        const dialogRef = this.dialog.open(VehicleDialogComponent, {
            width: '500px',
            data: vehicle
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadVehicles();
            }
        });
    }

    deleteVehicle(id: number) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            this.vehicleService.deleteVehicle(id).subscribe(() => {
                this.loadVehicles();
            });
        }
    }

    isItvExpired(dateStr?: string): boolean {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }
}
