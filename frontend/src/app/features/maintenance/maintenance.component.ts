import { Component, OnDestroy, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
export class MaintenanceComponent implements OnInit, OnDestroy {
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
    totalMaintenances = 0;
    pageSize = 25;
    pageIndex = 0;
    filterValue = '';
    sortBy: 'date' | 'description' | 'cost' | 'mileage' | 'vehicle' | 'supplier' | 'id' = 'date';
    sortDir: 'asc' | 'desc' = 'desc';
    private filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    displayedColumns: string[] = ['date', 'vehicle', 'description', 'supplier', 'parts', 'invoices', 'cost', 'actions'];

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.sort.sortChange.subscribe((sort: Sort) => {
            this.onSortChange(sort);
        });
    }

    ngOnDestroy(): void {
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
    }

    applyFilter(event: Event) {
        this.filterValue = (event.target as HTMLInputElement).value.trim();
        this.pageIndex = 0;
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
        this.filterDebounceTimer = setTimeout(() => this.loadMaintenances(), 250);
    }

    onSortChange(sort: Sort): void {
        const allowed = new Set(['date', 'description', 'cost', 'mileage', 'vehicle', 'supplier']);
        this.sortBy = (allowed.has(sort.active) ? sort.active : 'date') as 'date' | 'description' | 'cost' | 'mileage' | 'vehicle' | 'supplier' | 'id';
        this.sortDir = (sort.direction || 'desc') as 'asc' | 'desc';
        this.pageIndex = 0;
        this.loadMaintenances();
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
        this.maintenanceService.getMaintenancesPage({
            skip: this.pageIndex * this.pageSize,
            limit: this.pageSize,
            q: this.filterValue,
            sortBy: this.sortBy,
            sortDir: this.sortDir
        }).subscribe({
            next: (page) => {
                this.dataSource.data = page.items;
                this.totalMaintenances = page.total;
                this.isLoading = false;
            },
            error: (err) => {
                this.logger.error('Error loading maintenances', err);
                this.showSnackBar('Error loading maintenances');
                this.isLoading = false;
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadMaintenances();
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
                this.pageIndex = 0;
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
                    if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
                        this.pageIndex -= 1;
                    }
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
