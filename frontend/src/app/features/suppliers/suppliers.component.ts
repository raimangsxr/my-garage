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
import { Supplier, SupplierService } from '../../core/services/supplier.service';
import { SupplierDialogComponent } from './supplier-dialog/supplier-dialog.component';

@Component({
    selector: 'app-suppliers',
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
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<Supplier> = new MatTableDataSource<Supplier>([]);
    displayedColumns: string[] = ['name', 'email', 'phone', 'address', 'actions'];
    isLoading = false;
    totalSuppliers = 0;
    pageSize = 25;
    pageIndex = 0;
    filterValue = '';
    sortBy: 'name' | 'email' | 'phone' | 'address' | 'id' = 'name';
    sortDir: 'asc' | 'desc' = 'asc';
    private filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private supplierService: SupplierService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadSuppliers();
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
        this.filterDebounceTimer = setTimeout(() => this.loadSuppliers(), 250);
    }

    onSortChange(sort: Sort): void {
        const allowed = new Set(['name', 'email', 'phone', 'address']);
        this.sortBy = (allowed.has(sort.active) ? sort.active : 'name') as 'name' | 'email' | 'phone' | 'address' | 'id';
        this.sortDir = (sort.direction || 'asc') as 'asc' | 'desc';
        this.pageIndex = 0;
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        this.isLoading = true;
        this.supplierService.getSuppliersPage({
            skip: this.pageIndex * this.pageSize,
            limit: this.pageSize,
            q: this.filterValue,
            sortBy: this.sortBy,
            sortDir: this.sortDir
        }).subscribe({
            next: (page) => {
                this.dataSource.data = page.items;
                this.totalSuppliers = page.total;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading suppliers', err);
                this.showSnackBar('Error loading suppliers');
                this.isLoading = false;
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadSuppliers();
    }

    openSupplierDialog(supplier?: Supplier): void {
        const dialogRef = this.dialog.open(SupplierDialogComponent, {
            width: '500px',
            data: supplier || {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (supplier && supplier.id) {
                    this.updateSupplier(supplier.id, result);
                } else {
                    this.createSupplier(result);
                }
            }
        });
    }

    createSupplier(supplier: Supplier): void {
        this.supplierService.createSupplier(supplier).subscribe({
            next: () => {
                this.pageIndex = 0;
                this.loadSuppliers();
                this.showSnackBar('Supplier created successfully');
            },
            error: (err) => {
                console.error('Error creating supplier', err);
                this.showSnackBar('Error creating supplier');
            }
        });
    }

    updateSupplier(id: number, supplier: Supplier): void {
        this.supplierService.updateSupplier(id, supplier).subscribe({
            next: () => {
                this.loadSuppliers();
                this.showSnackBar('Supplier updated successfully');
            },
            error: (err) => {
                console.error('Error updating supplier', err);
                this.showSnackBar('Error updating supplier');
            }
        });
    }

    deleteSupplier(id: number): void {
        if (confirm('Are you sure you want to delete this supplier?')) {
            this.supplierService.deleteSupplier(id).subscribe({
                next: () => {
                    if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
                        this.pageIndex -= 1;
                    }
                    this.loadSuppliers();
                    this.showSnackBar('Supplier deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting supplier', err);
                    this.showSnackBar('Error deleting supplier');
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
