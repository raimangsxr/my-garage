import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

export interface VehicleData {
    year: number;
    kilometers?: number;
    next_itv_date?: string;
}

export interface VehicleSpecs {
    fuel_type?: string;
    engine_type?: string;
    transmission?: string;
    engine_oil_type?: string;
    coolant_type?: string;
    battery_type?: string;
    tire_size?: string;
}

export interface TrackStats {
    total_track_days?: number;
    favorite_circuit?: string;
}

@Component({
    selector: 'app-vehicle-stats-bar',
    standalone: true,
    imports: [CommonModule, StatCardComponent],
    templateUrl: './vehicle-stats-bar.component.html',
    styleUrls: ['./vehicle-stats-bar.component.scss']
})
export class VehicleStatsBarComponent {
    @Input() vehicle!: VehicleData;
    @Input() specs?: VehicleSpecs;
    @Input() trackStats?: TrackStats;

    isDateSoon(dateString: string): boolean {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    }

    isDateExpired(dateString: string): boolean {
        const date = new Date(dateString);
        const today = new Date();
        return date < today;
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    }
}
