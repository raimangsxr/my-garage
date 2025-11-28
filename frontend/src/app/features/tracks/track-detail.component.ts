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
        MatChipsModule
    ],
    templateUrl: './track-detail.component.html',
    styleUrl: './track-detail.component.scss'
})
export class TrackDetailComponent implements OnInit {
    private tracksService = inject(TracksService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    trackDetail: TrackDetail | null = null;
    loading = false;
    error: string | null = null;

    displayedColumns: string[] = ['date_achieved', 'best_lap_time', 'weather_conditions', 'tire_compound', 'group', 'organizer'];

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
}
