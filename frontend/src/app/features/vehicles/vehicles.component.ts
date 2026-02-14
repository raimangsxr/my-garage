import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { VehicleService, Vehicle } from '../../core/services/vehicle.service';
import { VehicleDialogComponent } from './vehicle-dialog/vehicle-dialog.component';
import { PageLoaderComponent } from '../../shared/components/page-loader/page-loader.component';

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
        PageLoaderComponent,
        MatPaginatorModule
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
    totalVehicles = 0;
    pageSize = 12;
    pageIndex = 0;

    @ViewChild(MatPaginator) paginator?: MatPaginator;

    ngOnInit() {
        this.loadVehicles();
    }

    loadVehicles() {
        this.isLoading = true;
        const skip = this.pageIndex * this.pageSize;
        this.vehicleService.getVehiclesPage(skip, this.pageSize).subscribe({
            next: (page) => {
                this.vehicles = page.items;
                this.totalVehicles = page.total;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading vehicles', error);
                this.isLoading = false;
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadVehicles();
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
                this.pageIndex = 0;
                this.loadVehicles();
            }
        });
    }

    deleteVehicle(id: number) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            this.vehicleService.deleteVehicle(id).subscribe(() => {
                if (this.vehicles.length === 1 && this.pageIndex > 0) {
                    this.pageIndex -= 1;
                }
                this.loadVehicles();
            });
        }
    }

    isItvExpired(dateStr?: string): boolean {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }
}
