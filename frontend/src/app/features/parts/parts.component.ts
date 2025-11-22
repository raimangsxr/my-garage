import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
        MatSnackBarModule
    ],
    templateUrl: './parts.component.html',
    styleUrls: ['./parts.component.scss']
})
export class PartsComponent implements OnInit {
    parts: Part[] = [];
    suppliers: Supplier[] = [];
    invoices: Invoice[] = [];
    maintenances: Maintenance[] = [];
    displayedColumns: string[] = ['name', 'reference', 'price', 'quantity', 'actions'];

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

    loadParts(): void {
        this.partService.getParts().subscribe({
            next: (data) => {
                this.parts = data;
            },
            error: (err) => {
                console.error('Error loading parts', err);
                this.showSnackBar('Error loading parts');
            }
        });
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
}
