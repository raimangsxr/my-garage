import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { TracksService } from './tracks.service';
import { TrackDetail, VehicleRecordGroup } from './tracks.models';
import { CircuitEvolutionChartComponent, ChartSeries } from '../../shared/components/circuit-evolution-chart/circuit-evolution-chart.component';
import { buildApiUrl } from '../../core/utils/api-url.util';
import { environment } from '../../../environments/environment';

// Color palette for vehicles
const VEHICLE_COLORS = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16'  // Lime
];

@Component({
    selector: 'app-track-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatChipsModule,
        CircuitEvolutionChartComponent
    ],
    templateUrl: './track-detail.component.html',
    styleUrl: './track-detail.component.scss'
})
export class TrackDetailComponent implements OnInit {
    private tracksService = inject(TracksService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    trackDetail: TrackDetail | null = null;
    trackMapUrl: string | null = null;
    mapUnavailable = false;
    loading = false;
    error: string | null = null;
    private originalTrackMapUrl: string | null = null;
    private tryingMapProxy = false;

    displayedColumns: string[] = ['date_achieved', 'best_lap_time', 'weather_conditions', 'tire_compound', 'group', 'organizer'];

    // Chart data as series
    get chartSeries(): ChartSeries[] {
        if (!this.trackDetail || !this.trackDetail.vehicle_groups) return [];

        return this.trackDetail.vehicle_groups
            .filter(group => group.records && group.records.length > 0)
            .map((group, index) => ({
                name: group.vehicle_name,
                color: VEHICLE_COLORS[index % VEHICLE_COLORS.length],
                records: group.records.map(r => ({
                    best_lap_time: r.best_lap_time,
                    date_achieved: r.date_achieved,
                    weather_conditions: r.weather_conditions,
                    tire_compound: r.tire_compound,
                    group: r.group,
                    organizer: r.organizer
                }))
            }));
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const trackId = params['id'];
            if (trackId) {
                this.loadTrackDetail(+trackId);
            }
        });
    }

    loadTrackDetail(trackId: number) {
        this.loading = true;
        this.error = null;

        this.tracksService.getTrackDetail(trackId).subscribe({
            next: (detail) => {
                this.trackDetail = detail;
                this.setTrackMapUrl(detail.image_url);
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Error loading track details';
                this.loading = false;
                console.error('Error loading track detail:', err);
            }
        });
    }

    goBack() {
        this.router.navigate(['/tracks']);
    }

    onTrackMapLoadError(): void {
        if (!this.originalTrackMapUrl) {
            this.trackMapUrl = null;
            this.mapUnavailable = true;
            return;
        }

        // External providers sometimes reject direct embedding; retry once via backend proxy.
        if (!this.tryingMapProxy && /^https?:\/\//i.test(this.originalTrackMapUrl)) {
            this.tryingMapProxy = true;
            this.trackMapUrl = this.buildProxyUrl(this.originalTrackMapUrl);
            return;
        }

        this.trackMapUrl = null;
        this.mapUnavailable = true;
    }

    getChartData(records: VehicleRecordGroup[]): any[] {
        // Flatten all records and sort by date
        const allRecords = records.flatMap(group =>
            group.records.map(r => ({
                ...r,
                vehicle_name: group.vehicle_name
            }))
        ).sort((a, b) => new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime());

        return allRecords;
    }

    // Helper to convert lap time string to seconds for chart
    lapTimeToSeconds(lapTime: string): number {
        const parts = lapTime.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0]);
            const seconds = parseFloat(parts[1]);
            return minutes * 60 + seconds;
        }
        return parseFloat(lapTime);
    }

    // Get min and max for chart scaling
    getMinMaxTimes(records: any[]): { min: number, max: number } {
        const times = records.map(r => this.lapTimeToSeconds(r.best_lap_time));
        return {
            min: Math.min(...times),
            max: Math.max(...times)
        };
    }

    // Calculate progress bar height
    getBarHeight(record: any, minMax: { min: number, max: number }): number {
        const time = this.lapTimeToSeconds(record.best_lap_time);
        const range = minMax.max - minMax.min;
        if (range === 0) return 100;
        // Invert: faster times (lower) should be taller bars
        return ((minMax.max - time) / range) * 100;
    }

    private setTrackMapUrl(rawUrl: string | null): void {
        this.originalTrackMapUrl = rawUrl?.trim() || null;
        this.tryingMapProxy = false;
        this.mapUnavailable = false;

        if (!this.originalTrackMapUrl) {
            this.trackMapUrl = null;
            this.mapUnavailable = true;
            return;
        }

        this.trackMapUrl = this.toAbsoluteUrl(this.originalTrackMapUrl);
    }

    private toAbsoluteUrl(value: string): string {
        if (/^(https?:|data:|blob:)/i.test(value)) {
            return value;
        }
        if (value.startsWith('//')) {
            return `https:${value}`;
        }

        const apiBase = environment.apiUrl.replace(/\/+$/, '');
        const apiOrigin = apiBase.replace(/\/api\/v\d+\/?$/, '');
        if (value.startsWith('/')) {
            return `${apiOrigin}${value}`;
        }
        return `${apiOrigin}/${value}`;
    }

    private buildProxyUrl(url: string): string {
        return `${buildApiUrl('vehicles/proxy-image')}?url=${encodeURIComponent(url)}`;
    }
}
