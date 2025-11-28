import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { TracksService } from './tracks.service';
import { TrackSummary } from './tracks.models';

@Component({
    selector: 'app-tracks',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule
    ],
    templateUrl: './tracks.component.html',
    styleUrl: './tracks.component.scss'
})
export class TracksComponent implements OnInit {
    private tracksService = inject(TracksService);
    private router = inject(Router);

    tracks: TrackSummary[] = [];
    filteredTracks: TrackSummary[] = [];
    loading = false;
    error: string | null = null;

    displayedColumns: string[] = ['name', 'location', 'length_meters', 'total_sessions', 'best_lap_time', 'vehicle_count', 'last_session_date', 'actions'];

    ngOnInit() {
        this.loadTracks();
    }

    loadTracks() {
        this.loading = true;
        this.error = null;

        this.tracksService.getTracks().subscribe({
            next: (tracks) => {
                // Only show tracks with at least one session
                const activeTracks = tracks.filter(t => t.total_sessions > 0);
                this.tracks = activeTracks;
                this.filteredTracks = activeTracks;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Error loading tracks';
                this.loading = false;
                console.error('Error loading tracks:', err);
            }
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredTracks = this.tracks.filter(track =>
            track.name.toLowerCase().includes(filterValue)
        );
    }

    sortData(sort: Sort) {
        const data = this.filteredTracks.slice();
        if (!sort.active || sort.direction === '') {
            this.filteredTracks = data;
            return;
        }

        this.filteredTracks = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return compare(a.name, b.name, isAsc);
                case 'total_sessions':
                    return compare(a.total_sessions, b.total_sessions, isAsc);
                case 'best_lap_time':
                    return compare(a.best_lap_time || '', b.best_lap_time || '', isAsc);
                case 'vehicle_count':
                    return compare(a.vehicle_count, b.vehicle_count, isAsc);
                case 'last_session_date':
                    return compare(a.last_session_date || '', b.last_session_date || '', isAsc);
                default:
                    return 0;
            }
        });
    }

    viewTrackDetail(track: TrackSummary) {
        this.router.navigate(['/tracks', track.id]);
    }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
