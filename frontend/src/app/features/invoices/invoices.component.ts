import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Invoice, InvoiceService } from '../../core/services/invoice.service';
import { InvoiceDialogComponent } from './invoice-dialog/invoice-dialog.component';
import { Maintenance, MaintenanceService } from '../../core/services/maintenance.service';

@Component({
    selector: 'app-invoices',
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
    templateUrl: './invoices.component.html',
    styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
    invoices: Invoice[] = [];
    maintenances: Maintenance[] = [];
    displayedColumns: string[] = ['number', 'date', 'amount', 'maintenance', 'actions'];

    constructor(
        private invoiceService: InvoiceService,
        private maintenanceService: MaintenanceService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.maintenanceService.getMaintenances().subscribe({
            next: (maintenances) => {
                this.maintenances = maintenances;
                this.loadInvoices();
            },
            error: (err) => {
                console.error('Error loading maintenances', err);
                this.showSnackBar('Error loading maintenances');
            }
        });
    }

    loadInvoices(): void {
        this.invoiceService.getInvoices().subscribe({
            next: (data) => {
                this.invoices = data;
            },
            error: (err) => {
                console.error('Error loading invoices', err);
                this.showSnackBar('Error loading invoices');
            }
        });
    }

    getMaintenanceDescription(maintenanceId?: number): string {
        if (!maintenanceId) return '-';
        const maintenance = this.maintenances.find(m => m.id === maintenanceId);
        return maintenance ? `${maintenance.description} (${maintenance.date})` : 'Unknown Maintenance';
    }

    openInvoiceDialog(invoice?: Invoice): void {
        const dialogRef = this.dialog.open(InvoiceDialogComponent, {
            width: '500px',
            data: { invoice: invoice || {}, maintenances: this.maintenances }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (invoice && invoice.id) {
                    this.updateInvoice(invoice.id, result);
                } else {
                    this.createInvoice(result);
                }
            }
        });
    }

    createInvoice(invoice: Invoice): void {
        this.invoiceService.createInvoice(invoice).subscribe({
            next: () => {
                this.loadInvoices();
                this.showSnackBar('Invoice created successfully');
            },
            error: (err) => {
                console.error('Error creating invoice', err);
                this.showSnackBar('Error creating invoice');
            }
        });
    }

    updateInvoice(id: number, invoice: Invoice): void {
        this.invoiceService.updateInvoice(id, invoice).subscribe({
            next: () => {
                this.loadInvoices();
                this.showSnackBar('Invoice updated successfully');
            },
            error: (err) => {
                console.error('Error updating invoice', err);
                this.showSnackBar('Error updating invoice');
            }
        });
    }

    deleteInvoice(id: number): void {
        if (confirm('Are you sure you want to delete this invoice?')) {
            this.invoiceService.deleteInvoice(id).subscribe({
                next: () => {
                    this.loadInvoices();
                    this.showSnackBar('Invoice deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting invoice', err);
                    this.showSnackBar('Error deleting invoice');
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
