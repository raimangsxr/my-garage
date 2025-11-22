import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Supplier, SupplierService } from '../../../core/services/supplier.service';
import { Invoice, InvoiceService } from '../../../core/services/invoice.service';
import { Maintenance, MaintenanceService } from '../../../core/services/maintenance.service';
import { MaintenanceDialogComponent } from '../../maintenance/maintenance-dialog/maintenance-dialog.component';
import { PartDialogComponent } from '../../parts/part-dialog/part-dialog.component';
import { InvoiceDialogComponent } from '../../invoices/invoice-dialog/invoice-dialog.component';

import { VehicleHeroComponent } from '../components/vehicle-hero/vehicle-hero.component';
import { VehicleStatsBarComponent } from '../components/vehicle-stats-bar/vehicle-stats-bar.component';
import { MaintenanceTimelineComponent } from '../components/maintenance-timeline/maintenance-timeline.component';
import { TorqueSpecsComponent } from '../components/torque-specs/torque-specs.component';
import { EntityColumnComponent } from '../../../shared/components/entity-column/entity-column.component';
import { EntityCardComponent } from '../../../shared/components/entity-card/entity-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
    selector: 'app-vehicle-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        VehicleHeroComponent,
        VehicleStatsBarComponent,
        MaintenanceTimelineComponent,
        TorqueSpecsComponent,
        EntityColumnComponent,
        EntityCardComponent,
        EmptyStateComponent
    ],
    templateUrl: './vehicle-detail.component.html',
    styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private vehicleService = inject(VehicleService);
    private supplierService = inject(SupplierService);
    private invoiceService = inject(InvoiceService);
    private maintenanceService = inject(MaintenanceService);
    private dialog = inject(MatDialog);

    vehicleDetails: any = null;
    loading = true;
    suppliers: Supplier[] = [];
    invoices: Invoice[] = [];
    maintenances: Maintenance[] = [];

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadVehicleDetails(parseInt(id));
            this.loadRelatedData();
        }
    }

    loadVehicleDetails(id: number) {
        this.vehicleService.getVehicleDetails(id).subscribe({
            next: (data) => {
                this.vehicleDetails = data;
                if (this.vehicleDetails.maintenances) {
                    this.vehicleDetails.maintenances.sort((a: any, b: any) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading vehicle details', err);
                this.loading = false;
            }
        });
    }

    loadRelatedData() {
        this.supplierService.getSuppliers().subscribe(data => this.suppliers = data);
        this.invoiceService.getInvoices().subscribe(data => this.invoices = data);
        this.maintenanceService.getMaintenances().subscribe(data => this.maintenances = data);
    }

    goBack() {
        this.router.navigate(['/vehicles']);
    }

    isDateSoon(dateStr?: string): boolean {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays >= 0 && diffDays <= 30;
    }

    isDateExpired(dateStr?: string): boolean {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }

    getAllParts(): any[] {
        return this.vehicleDetails?.parts || [];
    }

    getAllInvoices(): any[] {
        return this.vehicleDetails?.invoices || [];
    }

    hasPartsOrInvoices(): boolean {
        return this.getAllParts().length > 0 || this.getAllInvoices().length > 0;
    }

    openMaintenanceDialog(maintenance: any) {
        const dialogRef = this.dialog.open(MaintenanceDialogComponent, {
            width: '1000px',
            maxWidth: '95vw',
            data: {
                maintenance: maintenance,
                vehicles: [this.vehicleDetails.vehicle],
                suppliers: this.suppliers
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadVehicleDetails(this.vehicleDetails.vehicle.id);
            }
        });
    }

    openPartDialog(part: any) {
        this.dialog.open(PartDialogComponent, {
            width: '500px',
            data: {
                part: part,
                readOnly: true,
                suppliers: this.suppliers,
                invoices: this.invoices,
                maintenances: this.maintenances
            }
        });
    }

    openInvoiceDialog(invoice: any) {
        this.dialog.open(InvoiceDialogComponent, {
            width: '500px',
            data: {
                invoice: invoice,
                readOnly: true,
                maintenances: this.maintenances
            }
        });
    }
}
