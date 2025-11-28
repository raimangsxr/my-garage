import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Invoice, InvoiceService } from '../../core/services/invoice.service';
import { Maintenance, MaintenanceService } from '../../core/services/maintenance.service';
import { Supplier, SupplierService } from '../../core/services/supplier.service';
import { Vehicle, VehicleService } from '../../core/services/vehicle.service';
import { LoggerService } from '../../core/services/logger.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-invoices',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
        MatChipsModule,
        MatTooltipModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './invoices.component.html',
    styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<Invoice> = new MatTableDataSource<Invoice>([]);
    maintenances: Maintenance[] = [];
    suppliers: Supplier[] = [];
    vehicles: Vehicle[] = [];
    isLoading = false;
    displayedColumns: string[] = ['status', 'number', 'date', 'vehicle', 'supplier', 'amount', 'actions'];
    private pollSubscriptions: Subscription[] = [];

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private invoiceService = inject(InvoiceService);
    private maintenanceService = inject(MaintenanceService);
    private supplierService = inject(SupplierService);
    private vehicleService = inject(VehicleService);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);
    private logger = inject(LoggerService);

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        // Custom sorting for supplier name and other fields
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'supplier':
                    return this.getSupplierName(item.supplier_id).toLowerCase();
                case 'vehicle':
                    return this.getVehicleName(item.vehicle_id).toLowerCase();
                case 'date':
                    return item.date ? new Date(item.date).getTime() : 0;
                case 'amount':
                    return item.amount || 0;
                default:
                    return (item as any)[property];
            }
        };
    }

    ngOnDestroy(): void {
        this.pollSubscriptions.forEach(sub => sub.unsubscribe());
    }

    loadData(): void {
        this.isLoading = true;
        // Load suppliers
        this.supplierService.getSuppliers().subscribe({
            next: (suppliers) => {
                this.suppliers = suppliers;
            },
            error: (err) => this.logger.error('Error loading suppliers', err)
        });

        // Load vehicles
        this.vehicleService.getVehicles().subscribe({
            next: (vehicles) => {
                this.vehicles = vehicles;
            },
            error: (err) => this.logger.error('Error loading vehicles', err)
        });

        // Load maintenances
        this.maintenanceService.getMaintenances().subscribe({
            next: (maintenances) => {
                this.maintenances = maintenances;
            },
            error: (err) => this.logger.error('Error loading maintenances', err)
        });

        // Load invoices independently
        this.loadInvoices();
    }

    loadInvoices(): void {
        this.invoiceService.getInvoices().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.checkPendingInvoices();
                this.isLoading = false;
            },
            error: (err) => {
                this.logger.error('Error loading invoices', err);
                this.showSnackBar('Error loading invoices');
                this.isLoading = false;
            }
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    checkPendingInvoices() {
        // Cancel previous subscriptions
        this.pollSubscriptions.forEach(sub => sub.unsubscribe());
        this.pollSubscriptions = [];

        // Find pending or processing invoices
        const pendingInvoices = this.dataSource.data.filter(inv =>
            inv.status === 'pending' || inv.status === 'processing'
        );

        pendingInvoices.forEach(inv => {
            if (inv.id) {
                const sub = this.invoiceService.pollInvoiceStatus(inv.id).subscribe({
                    next: (updatedInv) => {
                        // Update in the list
                        const currentData = this.dataSource.data;
                        const index = currentData.findIndex(i => i.id === updatedInv.id);
                        if (index !== -1) {
                            currentData[index] = updatedInv;
                            this.dataSource.data = [...currentData]; // Trigger change detection
                        }

                        // If finished processing, reload everything to ensure consistency
                        if (updatedInv.status !== 'pending' && updatedInv.status !== 'processing') {
                            if (updatedInv.status === 'failed') {
                                this.showSnackBar(`Processing failed: ${updatedInv.error_message || 'Unknown error'}`);
                            } else if (updatedInv.status === 'review') {
                                this.showSnackBar('Invoice processed and ready for review');
                            }
                            this.loadInvoices();
                        }
                    }
                });
                this.pollSubscriptions.push(sub);
            }
        });
    }

    getSupplierName(supplierId?: number): string {
        if (!supplierId) return '-';
        const supplier = this.suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : '-';
    }

    getVehicleName(vehicleId?: number): string {
        if (!vehicleId) return '-';
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})` : '-';
    }

    uploadInvoice(): void {
        this.router.navigate(['/invoices/upload']);
    }

    reviewInvoice(invoice: Invoice): void {
        if (invoice.status === 'review' && invoice.id) {
            this.router.navigate(['/invoices/review', invoice.id]);
        }
    }

    retryInvoice(invoice: Invoice): void {
        if (!invoice.id) return;

        this.invoiceService.retryInvoice(invoice.id).subscribe({
            next: () => {
                this.showSnackBar('Retrying invoice processing...');
                // Update status locally for immediate feedback
                invoice.status = 'pending';
                // Start polling
                this.checkPendingInvoices();
            },
            error: (err) => {
                this.logger.error('Error retrying invoice', err);
                this.showSnackBar('Error retrying invoice');
            }
        });
    }

    viewDetails(invoiceId: number): void {
        this.router.navigate(['/invoices', invoiceId]);
    }

    deleteInvoice(id: number): void {
        if (confirm('Are you sure you want to delete this invoice?')) {
            this.invoiceService.deleteInvoice(id).subscribe({
                next: () => {
                    this.loadInvoices();
                    this.showSnackBar('Invoice deleted successfully');
                },
                error: (err) => {
                    this.logger.error('Error deleting invoice', err);
                    this.showSnackBar('Error deleting invoice');
                }
            });
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'approved': return 'primary';
            case 'review': return 'accent';
            case 'processing': return 'warn';
            case 'failed': return 'warn';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'approved': return 'APPROVED';
            case 'review': return 'APPROVAL PENDING';
            case 'processing': return 'PROCESSING';
            case 'pending': return 'PROCESSING';
            case 'failed': return 'FAILED';
            default: return status.toUpperCase();
        }
    }

    private showSnackBar(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000
        });
    }
}
