import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TracksService } from './tracks.service';
import { TrackDetail } from './tracks.models';
import { CircuitEvolutionChartComponent, ChartSeries } from '../../shared/components/circuit-evolution-chart/circuit-evolution-chart.component';

@Component({
    selector: 'app-track-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatTableModule,
        MatProgressSpinnerModule,
        CircuitEvolutionChartComponent
    ],
    templateUrl: './track-detail.component.html',
    styleUrls: ['./track-detail.component.scss']
})
export class TrackDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private tracksService = inject(TracksService);

    trackId: number | null = null;
    trackDetail: TrackDetail | null = null;
    loading = true;
    error: string | null = null;

    displayedColumns: string[] = ['date_achieved', 'best_lap_time', 'weather_conditions', 'tire_compound', 'group', 'organizer'];

    // Predefined colors for vehicles
    private vehicleColors = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Orange
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#6366f1', // Indigo
        '#14b8a6'  // Teal
    ];

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.trackId = +idParam;
            this.loadTrackDetail(this.trackId);
        } else {
            this.error = 'Invalid track ID';
            this.loading = false;
        }
    }

    loadTrackDetail(id: number) {
        this.loading = true;
        this.tracksService.getTrackDetail(id).subscribe({
            next: (data) => {
                this.trackDetail = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading track detail:', err);
                this.error = 'Failed to load track details. Please try again.';
                this.loading = false;
            }
        });
    }

    get chartData(): ChartSeries[] {
        if (!this.trackDetail || !this.trackDetail.vehicle_groups) return [];

        return this.trackDetail.vehicle_groups
            .filter(group => group.records && group.records.length > 0)
            .map((group, index) => ({
                name: group.vehicle_name,
                color: this.vehicleColors[index % this.vehicleColors.length],
                records: group.records
            }));
    }

    goBack() {
        this.router.navigate(['/tracks']);
    }
}
