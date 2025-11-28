import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaintenanceService, Maintenance } from '../../core/services/maintenance.service';
import { VehicleService, Vehicle } from '../../core/services/vehicle.service';
import { Supplier, SupplierService } from '../../core/services/supplier.service';
import { MaintenanceDialogComponent } from './maintenance-dialog/maintenance-dialog.component';
import { LoggerService } from '../../core/services/logger.service';

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
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatProgressSpinnerModule
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
    private logger = inject(LoggerService);

    dataSource: MatTableDataSource<Maintenance> = new MatTableDataSource<Maintenance>([]);
    vehicles: Vehicle[] = [];
    suppliers: Supplier[] = [];
    isLoading = false;
    displayedColumns: string[] = ['date', 'vehicle', 'description', 'supplier', 'parts', 'invoices', 'cost', 'actions'];

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        // Custom sorting for nested properties
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'vehicle':
                    return this.getVehicleName(item.vehicle_id).toLowerCase();
                case 'supplier':
                    return this.getSupplierName(item.supplier_id).toLowerCase();
                case 'date':
                    return item.date ? new Date(item.date).getTime() : 0;
                default:
                    return (item as any)[property];
            }
        };

        // Custom filter predicate to search across multiple fields including related data
        this.dataSource.filterPredicate = (data: Maintenance, filter: string) => {
            const searchStr = filter.toLowerCase();
            const vehicleName = this.getVehicleName(data.vehicle_id).toLowerCase();
            const supplierName = this.getSupplierName(data.supplier_id).toLowerCase();
            const description = (data.description || '').toLowerCase();
            const date = (data.date || '').toLowerCase();

            return vehicleName.includes(searchStr) ||
                supplierName.includes(searchStr) ||
                description.includes(searchStr) ||
                date.includes(searchStr);
        };
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    loadData(): void {
        this.isLoading = true;
        this.vehicleService.getVehicles().subscribe({
            next: (vehicles) => {
                this.vehicles = vehicles;
                this.loadSuppliers(); // Load suppliers before maintenances to ensure names are available for sorting/filtering
            },
            error: (err) => {
                this.logger.error('Error loading vehicles', err);
                this.showSnackBar('Error loading vehicles');
            }
        });
    }

    loadSuppliers(): void {
        this.supplierService.getSuppliers().subscribe({
            next: (suppliers) => {
                this.suppliers = suppliers;
                this.loadMaintenances();
            },
            error: (err) => {
                this.logger.error('Error loading suppliers', err);
                this.loadMaintenances(); // Load maintenances anyway
            }
        });
    }

    loadMaintenances(): void {
        this.maintenanceService.getMaintenances().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.logger.error('Error loading maintenances', err);
                this.showSnackBar('Error loading maintenances');
                this.isLoading = false;
            }
        });
    }

    getVehicleName(vehicleId?: number): string {
        if (!vehicleId) return '-';
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
    }

    getSupplierName(supplierId?: number): string {
        if (!supplierId) return '-';
        const supplier = this.suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : '-';
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
            width: '1000px',
            maxWidth: '95vw',
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
                this.logger.error('Error creating maintenance', err);
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
                this.logger.error('Error updating maintenance', err);
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
                    this.logger.error('Error deleting maintenance', err);
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
