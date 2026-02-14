import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VehicleService, TrackRecord } from '../../../core/services/vehicle.service';
import { Supplier, SupplierService } from '../../../core/services/supplier.service';
import { Invoice, InvoiceService } from '../../../core/services/invoice.service';
import { Maintenance, MaintenanceService } from '../../../core/services/maintenance.service';
import { MaintenanceDialogComponent } from '../../maintenance/maintenance-dialog/maintenance-dialog.component';
import { PartDialogComponent } from '../../parts/part-dialog/part-dialog.component';
import { LoggerService } from '../../../core/services/logger.service';
import { Subscription } from 'rxjs';

import { VehicleHeroComponent } from '../components/vehicle-hero/vehicle-hero.component';
import { VehicleStatsBarComponent, TrackStats } from '../components/vehicle-stats-bar/vehicle-stats-bar.component';
import { MaintenanceTimelineComponent } from '../components/maintenance-timeline/maintenance-timeline.component';
import { TorqueSpecsComponent } from '../components/torque-specs/torque-specs.component';
import { VehiclePartsListComponent } from '../components/vehicle-parts-list/vehicle-parts-list.component';
import { TrackRecordsComponent } from '../components/track-records/track-records';
import { EntityColumnComponent } from '../../../shared/components/entity-column/entity-column.component';
import { EntityCardComponent } from '../../../shared/components/entity-card/entity-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageLoaderComponent } from '../../../shared/components/page-loader/page-loader.component';

import { UniquePipe } from '../../../shared/pipes/unique.pipe';

@Component({
    selector: 'app-vehicle-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatButtonToggleModule,
        VehicleHeroComponent,
        VehicleStatsBarComponent,
        MaintenanceTimelineComponent,
        TorqueSpecsComponent,
        VehiclePartsListComponent,
        TrackRecordsComponent,
        EntityColumnComponent,
        EntityCardComponent,
        EmptyStateComponent,
        PageLoaderComponent,
        UniquePipe
    ],
    templateUrl: './vehicle-detail.component.html',
    styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private vehicleService = inject(VehicleService);
    private supplierService = inject(SupplierService);
    private invoiceService = inject(InvoiceService);
    private maintenanceService = inject(MaintenanceService);
    private dialog = inject(MatDialog);
    private logger = inject(LoggerService);
    private subscriptions = new Subscription();

    vehicleDetails: any = null;
    loading = true;
    suppliers: Supplier[] = [];
    invoices: Invoice[] = [];
    maintenances: Maintenance[] = [];

    // Track mode
    viewMode: 'street' | 'track' = 'street';
    trackRecords: TrackRecord[] = [];
    trackStats: TrackStats = {};

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadVehicleDetails(parseInt(id));
            this.loadRelatedData();
        }
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    loadVehicleDetails(id: number) {
        this.subscriptions.add(
            this.vehicleService.getVehicleDetails(id).subscribe({
                next: (data) => {
                    this.vehicleDetails = data;
                    if (this.vehicleDetails.maintenances) {
                        this.vehicleDetails.maintenances.sort((a: any, b: any) =>
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        );
                    }

                    // Load track records if available
                    if (this.vehicleDetails.track_records) {
                        this.trackRecords = this.vehicleDetails.track_records;
                        this.calculateTrackStats();
                    }

                    // Default to street mode as requested
                    this.viewMode = 'street';

                    this.loading = false;
                },
                error: (err) => {
                    this.logger.error('Error loading vehicle details', err);
                    this.loading = false;
                }
            })
        );
    }

    loadRelatedData() {
        this.subscriptions.add(this.supplierService.getSuppliers().subscribe(data => this.suppliers = data));
        this.subscriptions.add(this.invoiceService.getInvoices().subscribe(data => this.invoices = data));
        this.subscriptions.add(this.maintenanceService.getMaintenances().subscribe(data => this.maintenances = data));
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

    get parts(): any[] {
        return this.getAllParts();
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

        this.subscriptions.add(
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.loadVehicleDetails(this.vehicleDetails.vehicle.id);
                }
            })
        );
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

    openInvoiceUpload() {
        this.router.navigate(['/invoices/upload'], {
            queryParams: { vehicleId: this.vehicleDetails.vehicle.id }
        });
    }

    openInvoiceDetails(invoiceId: number) {
        this.router.navigate(['/invoices', invoiceId]);
    }

    onSaveTorqueSpecs(specs: any[]) {
        if (!this.vehicleDetails?.vehicle?.id) return;

        this.subscriptions.add(
            this.vehicleService.updateTorqueSpecs(this.vehicleDetails.vehicle.id, specs).subscribe({
                next: (response) => {
                    // Update local state
                    if (!this.vehicleDetails.specs) {
                        this.vehicleDetails.specs = {};
                    }
                    this.vehicleDetails.specs.torque_specs = response.specs;
                    this.logger.info('Torque specs updated successfully');
                },
                error: (error) => {
                    this.logger.error('Error updating torque specs', error);
                }
            })
        );
    }

    // Track mode methods
    toggleViewMode() {
        this.viewMode = this.viewMode === 'street' ? 'track' : 'street';
    }

    get showViewModeToggle(): boolean {
        return this.vehicleDetails?.vehicle?.usage_type === 'both' ||
            this.vehicleDetails?.vehicle?.usage_type === 'track';
    }

    calculateTrackStats() {
        if (!this.trackRecords.length) {
            this.trackStats = { total_track_days: 0, favorite_circuit: '-' };
            return;
        }

        // Calculate unique track days - normalize dates to YYYY-MM-DD format
        const uniqueDates = new Set(
            this.trackRecords.map(r => {
                const date = new Date(r.date_achieved);
                return date.toISOString().split('T')[0];
            })
        );

        // Calculate favorite circuit
        const circuitCounts = new Map<string, number>();
        this.trackRecords.forEach(r => {
            circuitCounts.set(r.circuit_name, (circuitCounts.get(r.circuit_name) || 0) + 1);
        });

        let favoriteCircuit = '-';
        let maxVisits = 0;

        circuitCounts.forEach((count, circuit) => {
            if (count > maxVisits) {
                maxVisits = count;
                favoriteCircuit = circuit;
            }
        });

        this.trackStats = {
            total_track_days: uniqueDates.size,
            favorite_circuit: favoriteCircuit
        };
    }

    onTrackRecordAdded(record: TrackRecord) {
        if (!this.vehicleDetails?.vehicle?.id) return;

        this.subscriptions.add(
            this.vehicleService.createTrackRecord(this.vehicleDetails.vehicle.id, record).subscribe({
                next: (newRecord) => {
                    this.trackRecords.push(newRecord);
                    this.calculateTrackStats();
                    this.logger.info('Track record added successfully');
                },
                error: (error) => {
                    this.logger.error('Error adding track record', error);
                }
            })
        );
    }

    onTrackRecordUpdated(record: TrackRecord) {
        if (!record.id) return;

        this.subscriptions.add(
            this.vehicleService.updateTrackRecord(record.id, record).subscribe({
                next: (updatedRecord) => {
                    const index = this.trackRecords.findIndex(r => r.id === updatedRecord.id);
                    if (index !== -1) {
                        this.trackRecords[index] = updatedRecord;
                        this.calculateTrackStats();
                    }
                    this.logger.info('Track record updated successfully');
                },
                error: (error) => {
                    this.logger.error('Error updating track record', error);
                }
            })
        );
    }

    onTrackRecordDeleted(recordId: number) {
        this.subscriptions.add(
            this.vehicleService.deleteTrackRecord(recordId).subscribe({
                next: () => {
                    this.trackRecords = this.trackRecords.filter(r => r.id !== recordId);
                    this.calculateTrackStats();
                    this.logger.info('Track record deleted successfully');
                },
                error: (error) => {
                    this.logger.error('Error deleting track record', error);
                }
            })
        );
    }
}
