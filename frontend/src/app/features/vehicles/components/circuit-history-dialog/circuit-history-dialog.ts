import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrackRecord } from '../../../../core/services/vehicle.service';
import { TrackRecordDialogComponent } from '../track-record-dialog/track-record-dialog';
import { CircuitEvolutionChartComponent, ChartSeries } from '../../../../shared/components/circuit-evolution-chart/circuit-evolution-chart.component';

export interface CircuitHistoryData {
    circuitName: string;
    records: TrackRecord[];
}

@Component({
    selector: 'app-circuit-history-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        CircuitEvolutionChartComponent
    ],
    templateUrl: './circuit-history-dialog.html',
    styleUrls: ['./circuit-history-dialog.scss']
})
export class CircuitHistoryDialogComponent {
    private dialogRef = inject(MatDialogRef<CircuitHistoryDialogComponent>);
    private dialog = inject(MatDialog);
    data: CircuitHistoryData = inject(MAT_DIALOG_DATA);

    sortBy: 'date' | 'time' = 'date';
    sortDirection: 'asc' | 'desc' = 'desc';

    get sortedRecords(): TrackRecord[] {
        return [...this.data.records].sort((a, b) => {
            if (this.sortBy === 'time') {
                const timeA = this.timeToSeconds(a.best_lap_time);
                const timeB = this.timeToSeconds(b.best_lap_time);
                return this.sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
            } else {
                const dateA = new Date(a.date_achieved).getTime();
                const dateB = new Date(b.date_achieved).getTime();
                return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            }
        });
    }

    get bestRecord(): TrackRecord | undefined {
        if (!this.data.records.length) return undefined;
        return [...this.data.records].sort((a, b) =>
            this.timeToSeconds(a.best_lap_time) - this.timeToSeconds(b.best_lap_time)
        )[0];
    }

    get chartSeries(): ChartSeries[] {
        if (!this.data.records || this.data.records.length < 2) return [];

        return [{
            name: 'Lap Time',
            color: '#3b82f6', // Blue
            records: this.data.records
        }];
    }

    toggleSort(column: 'date' | 'time') {
        if (this.sortBy === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = column;
            this.sortDirection = column === 'time' ? 'asc' : 'desc';
        }
    }

    isBestLap(record: TrackRecord): boolean {
        const best = [...this.data.records].sort((a, b) =>
            this.timeToSeconds(a.best_lap_time) - this.timeToSeconds(b.best_lap_time)
        )[0];
        return record === best;
    }

    timeToSeconds(timeStr: string): number {
        // Format: MM:SS.ms or M:SS.ms or SS.ms
        try {
            const parts = timeStr.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
            } else {
                return parseFloat(parts[0]);
            }
        } catch (e) {
            return 999999; // Fallback for bad data
        }
    }

    editRecord(record: TrackRecord) {
        const dialogRef = this.dialog.open(TrackRecordDialogComponent, {
            width: '600px',
            data: record
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dialogRef.close({ action: 'update', record: result });
            }
        });
    }

    deleteRecord(record: TrackRecord) {
        if (confirm('Are you sure you want to delete this session record?')) {
            this.dialogRef.close({ action: 'delete', recordId: record.id });
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
