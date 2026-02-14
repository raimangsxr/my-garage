import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Part, PartService } from '../../core/services/part.service';
import { PartDialogComponent } from './part-dialog/part-dialog.component';
import { Supplier, SupplierService } from '../../core/services/supplier.service';
import { Invoice, InvoiceService } from '../../core/services/invoice.service';
import { Maintenance, MaintenanceService } from '../../core/services/maintenance.service';

@Component({
    selector: 'app-parts',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './parts.component.html',
    styleUrls: ['./parts.component.scss']
})
export class PartsComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<Part> = new MatTableDataSource<Part>([]);
    suppliers: Supplier[] = [];
    invoices: Invoice[] = [];
    maintenances: Maintenance[] = [];
    isLoading = false;
    totalParts = 0;
    pageSize = 25;
    pageIndex = 0;
    filterValue = '';
    sortBy: 'name' | 'reference' | 'price' | 'quantity' | 'id' = 'name';
    sortDir: 'asc' | 'desc' = 'asc';
    private filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    displayedColumns: string[] = ['name', 'reference', 'price', 'quantity', 'actions'];

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private partService: PartService,
        private supplierService: SupplierService,
        private invoiceService: InvoiceService,
        private maintenanceService: MaintenanceService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadParts();
        this.loadRelatedData();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.sort.sortChange.subscribe((sort: Sort) => {
            this.onSortChange(sort);
        });
    }

    applyFilter(event: Event) {
        this.filterValue = (event.target as HTMLInputElement).value.trim();
        this.pageIndex = 0;
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
        this.filterDebounceTimer = setTimeout(() => this.loadParts(), 250);
    }

    onSortChange(sort: Sort): void {
        const allowed = new Set(['name', 'reference', 'price', 'quantity']);
        this.sortBy = (allowed.has(sort.active) ? sort.active : 'name') as 'name' | 'reference' | 'price' | 'quantity' | 'id';
        this.sortDir = (sort.direction || 'asc') as 'asc' | 'desc';
        this.pageIndex = 0;
        this.loadParts();
    }

    loadParts(): void {
        this.isLoading = true;
        this.partService.getPartsPage({
            skip: this.pageIndex * this.pageSize,
            limit: this.pageSize,
            q: this.filterValue,
            sortBy: this.sortBy,
            sortDir: this.sortDir
        }).subscribe({
            next: (page) => {
                this.dataSource.data = page.items;
                this.totalParts = page.total;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading parts', err);
                this.showSnackBar('Error loading parts');
                this.isLoading = false;
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadParts();
    }

    loadRelatedData(): void {
        this.supplierService.getSuppliers().subscribe(data => this.suppliers = data);
        this.invoiceService.getInvoices().subscribe(data => this.invoices = data);
        this.maintenanceService.getMaintenances().subscribe(data => this.maintenances = data);
    }

    openPartDialog(part?: Part): void {
        const dialogRef = this.dialog.open(PartDialogComponent, {
            width: '400px',
            data: {
                part: part || {},
                suppliers: this.suppliers,
                invoices: this.invoices,
                maintenances: this.maintenances
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (part && part.id) {
                    this.updatePart(part.id, result);
                } else {
                    this.createPart(result);
                }
            }
        });
    }

    createPart(part: Part): void {
        this.partService.createPart(part).subscribe({
            next: () => {
                this.pageIndex = 0;
                this.loadParts();
                this.showSnackBar('Part created successfully');
            },
            error: (err) => {
                console.error('Error creating part', err);
                this.showSnackBar('Error creating part');
            }
        });
    }

    updatePart(id: number, part: Part): void {
        this.partService.updatePart(id, part).subscribe({
            next: () => {
                this.loadParts();
                this.showSnackBar('Part updated successfully');
            },
            error: (err) => {
                console.error('Error updating part', err);
                this.showSnackBar('Error updating part');
            }
        });
    }

    deletePart(id: number): void {
        if (confirm('Are you sure you want to delete this part?')) {
            this.partService.deletePart(id).subscribe({
                next: () => {
                    if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
                        this.pageIndex -= 1;
                    }
                    this.loadParts();
                    this.showSnackBar('Part deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting part', err);
                    this.showSnackBar('Error deleting part');
                }
            });
        }
    }

    private showSnackBar(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000
        });
    }

    ngOnDestroy(): void {
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
    }
}
