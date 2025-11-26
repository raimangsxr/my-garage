import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
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
        MatTooltipModule
    ],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
    dataSource: MatTableDataSource<Supplier> = new MatTableDataSource<Supplier>([]);
    displayedColumns: string[] = ['name', 'email', 'phone', 'address', 'actions'];

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
        this.dataSource.paginator = this.paginator;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    loadSuppliers(): void {
        this.supplierService.getSuppliers().subscribe({
            next: (data) => {
                this.dataSource.data = data;
            },
            error: (err) => {
                console.error('Error loading suppliers', err);
                this.showSnackBar('Error loading suppliers');
            }
        });
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
