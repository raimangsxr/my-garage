import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
        MatDialogModule
    ],
    templateUrl: './vehicles.component.html',
    styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
    private vehicleService = inject(VehicleService);
    private dialog = inject(MatDialog);

    vehicles: Vehicle[] = [];

    ngOnInit() {
        this.loadVehicles();
    }

    loadVehicles() {
        this.vehicleService.getVehicles().subscribe(vehicles => {
            this.vehicles = vehicles;
        });
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
