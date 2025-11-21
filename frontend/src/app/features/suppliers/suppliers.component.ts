import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
        MatSnackBarModule
    ],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
    suppliers: Supplier[] = [];
    displayedColumns: string[] = ['name', 'email', 'phone', 'address', 'actions'];

    constructor(
        private supplierService: SupplierService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        this.supplierService.getSuppliers().subscribe({
            next: (data) => {
                this.suppliers = data;
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
