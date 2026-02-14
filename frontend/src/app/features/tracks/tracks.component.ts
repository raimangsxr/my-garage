import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TracksService } from './tracks.service';
import { TrackSummary } from './tracks.models';
import { PageLoaderComponent } from '../../shared/components/page-loader/page-loader.component';

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
        PageLoaderComponent,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatPaginatorModule
    ],
    templateUrl: './tracks.component.html',
    styleUrl: './tracks.component.scss'
})
export class TracksComponent implements OnInit, OnDestroy {
    private tracksService = inject(TracksService);
    private router = inject(Router);

    tracks: TrackSummary[] = [];
    loading = false;
    error: string | null = null;
    totalTracks = 0;
    pageSize = 25;
    pageIndex = 0;
    filterValue = '';
    sortBy: 'name' | 'location' | 'length_meters' | 'total_sessions' | 'best_lap_time' | 'vehicle_count' | 'last_session_date' | 'id' = 'name';
    sortDir: 'asc' | 'desc' = 'asc';
    private filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    displayedColumns: string[] = ['name', 'location', 'length_meters', 'total_sessions', 'best_lap_time', 'vehicle_count', 'last_session_date', 'actions'];

    ngOnInit() {
        this.loadTracks();
    }

    ngOnDestroy(): void {
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
    }

    loadTracks() {
        this.loading = true;
        this.error = null;

        this.tracksService.getTracksPage({
            skip: this.pageIndex * this.pageSize,
            limit: this.pageSize,
            q: this.filterValue,
            onlyActive: true,
            sortBy: this.sortBy,
            sortDir: this.sortDir
        }).subscribe({
            next: (page) => {
                this.tracks = page.items;
                this.totalTracks = page.total;
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
        this.filterValue = (event.target as HTMLInputElement).value.trim();
        this.pageIndex = 0;
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
        this.filterDebounceTimer = setTimeout(() => this.loadTracks(), 250);
    }

    sortData(sort: Sort) {
        const allowed = new Set(['name', 'location', 'length_meters', 'total_sessions', 'best_lap_time', 'vehicle_count', 'last_session_date']);
        this.sortBy = (allowed.has(sort.active) ? sort.active : 'name') as 'name' | 'location' | 'length_meters' | 'total_sessions' | 'best_lap_time' | 'vehicle_count' | 'last_session_date' | 'id';
        this.sortDir = (sort.direction || 'asc') as 'asc' | 'desc';
        this.pageIndex = 0;
        this.loadTracks();
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadTracks();
    }

    viewTrackDetail(track: TrackSummary) {
        this.router.navigate(['/tracks', track.id]);
    }
}
