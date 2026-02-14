import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoiceService, Invoice, InvoiceExtractedData } from '../../../core/services/invoice.service';
import { Maintenance, MaintenanceService } from '../../../core/services/maintenance.service';
import { Part, PartService } from '../../../core/services/part.service';
import { ImageDialogComponent } from '../../../shared/components/image-dialog/image-dialog.component';
import { PageLoaderComponent } from '../../../shared/components/page-loader/page-loader.component';

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule,
        MatDialogModule,
        MatTooltipModule,
        PageLoaderComponent
    ],
    templateUrl: './invoice-detail.component.html',
    styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
    invoiceId: number | null = null;
    invoice: Invoice | null = null;
    extractedData: InvoiceExtractedData | null = null;
    maintenances: Maintenance[] = [];
    parts: Part[] = [];
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private invoiceService: InvoiceService,
        private maintenanceService: MaintenanceService,
        private partService: PartService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.invoiceId = +params['id'];
                this.loadData();
            }
        });
    }

    loadData() {
        if (!this.invoiceId) return;
        this.loading = true;

        // Load invoice basic info
        this.invoiceService.getInvoice(this.invoiceId).subscribe({
            next: (inv) => {
                this.invoice = inv;

                // Load extracted data if available
                if (inv.status === 'review' || inv.status === 'approved') {
                    this.invoiceService.getExtractedData(this.invoiceId!).subscribe({
                        next: (data) => {
                            this.extractedData = data;

                            // If approved, load actual maintenance and parts from database
                            if (inv.status === 'approved') {
                                this.loadMaintenancesAndParts();
                            } else {
                                this.loading = false;
                            }
                        },
                        error: (err) => {
                            console.error('Error loading extracted data', err);
                            this.loading = false;
                        }
                    });
                } else {
                    this.loading = false;
                }
            },
            error: (err) => {
                console.error('Error loading invoice', err);
                this.loading = false;
            }
        });
    }

    loadMaintenancesAndParts() {
        // Load all maintenances and filter by invoice
        this.maintenanceService.getMaintenances().subscribe({
            next: (allMaintenances) => {
                // Filter maintenances that have parts linked to this invoice
                this.partService.getParts().subscribe({
                    next: (allParts) => {
                        // Get parts for this invoice
                        const invoiceParts = allParts.filter(p => p.invoice_id === this.invoiceId);
                        this.parts = invoiceParts;

                        // Get unique maintenance IDs from these parts
                        const maintenanceIds = new Set(invoiceParts
                            .filter(p => p.maintenance_id)
                            .map(p => p.maintenance_id));

                        // Filter maintenances
                        this.maintenances = allMaintenances.filter(m =>
                            maintenanceIds.has(m.id)
                        );

                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Error loading parts', err);
                        this.loading = false;
                    }
                });
            },
            error: (err) => {
                console.error('Error loading maintenances', err);
                this.loading = false;
            }
        });
    }

    getPartsByMaintenance(maintenanceId: number): Part[] {
        return this.parts.filter(p => p.maintenance_id === maintenanceId);
    }

    getPartsOnly(): Part[] {
        return this.parts.filter(p => !p.maintenance_id);
    }

    openImagePreview() {
        if (this.invoice?.file_url) {
            this.dialog.open(ImageDialogComponent, {
                data: { imageUrl: this.invoice.file_url },
                panelClass: 'image-preview-dialog',
                maxWidth: '95vw',
                maxHeight: '95vh'
            });
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'approved': return 'success';
            case 'review': return 'accent';
            case 'processing': return 'primary';
            case 'failed': return 'warn';
            default: return 'default';
        }
    }

    get taxRate(): number {
        if (!this.extractedData?.subtotal || !this.extractedData?.tax_amount) return 0;
        return this.extractedData.tax_amount / this.extractedData.subtotal;
    }

    getAmountAfterTax(amount: number): number {
        return amount * (1 + this.taxRate);
    }
}
