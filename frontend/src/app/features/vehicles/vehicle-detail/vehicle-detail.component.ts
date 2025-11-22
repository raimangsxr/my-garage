import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VehicleService } from '../../../core/services/vehicle.service';

@Component({
    selector: 'app-vehicle-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './vehicle-detail.component.html',
    styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private vehicleService = inject(VehicleService);

    vehicleDetails: any = null;
    loading = true;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadVehicleDetails(parseInt(id));
        }
    }

    loadVehicleDetails(id: number) {
        this.vehicleService.getVehicleDetails(id).subscribe({
            next: (data) => {
                this.vehicleDetails = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading vehicle details', err);
                this.loading = false;
            }
        });
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
        if (!this.vehicleDetails?.maintenances) return [];
        return this.vehicleDetails.maintenances.flatMap((m: any) => m.parts || []);
    }

    getAllInvoices(): any[] {
        if (!this.vehicleDetails?.maintenances) return [];
        return this.vehicleDetails.maintenances
            .map((m: any) => m.invoice)
            .filter((inv: any) => inv !== null);
    }

    hasPartsOrInvoices(): boolean {
        return this.getAllParts().length > 0 || this.getAllInvoices().length > 0;
    }
}
