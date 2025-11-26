import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrackRecord } from '../../../../core/services/vehicle.service';
import { TrackRecordDialogComponent } from '../track-record-dialog/track-record-dialog';

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
        MatTooltipModule
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
    selectedPointIndex: number | null = null; // Track which marker is clicked

    selectPoint(index: number): void {
        this.selectedPointIndex = this.selectedPointIndex === index ? null : index;
    }

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

    get chartData(): {
        points: string,
        areaPoints: string,
        dataPoints: { x: number, y: number, xPercent: number, yPercent: number, time: string, date: Date, dateLabel: string }[],
        yScale: { labels: { value: string, position: number }[] },
        xLabels: { x: number, label: string }[],
        scaleMin: number,
        scaleMax: number
    } {
        const records = [...this.data.records].sort((a, b) =>
            new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime()
        );

        if (records.length < 2) return {
            points: '',
            areaPoints: '',
            dataPoints: [],
            yScale: { labels: [] },
            xLabels: [],
            scaleMin: 0,
            scaleMax: 0
        };

        const times = records.map(r => this.timeToSeconds(r.best_lap_time));
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        // Fixed scale: 2 seconds below best (faster), 2 seconds above worst (slower)
        const scaleMin = minTime - 2;  // Fastest possible (will be at top)
        const scaleMax = maxTime + 2;  // Slowest possible (will be at bottom)
        const scaleRange = scaleMax - scaleMin;

        // Calculate data points
        const dataPoints = records.map((r, i) => {
            const x = (i / (records.length - 1)) * 100;
            const time = this.timeToSeconds(r.best_lap_time);

            // Y position: faster times (lower numbers) at BOTTOM (y=100), slower times (higher numbers) at TOP (y=0)
            const normalized = (time - scaleMin) / scaleRange;
            const y = 100 - (normalized * 100); // Invert: faster at bottom (100), slower at top (0)

            const date = new Date(r.date_achieved);
            return {
                x,
                y,
                xPercent: x,
                yPercent: normalized * 100, // For HTML positioning (bottom-based): faster at 0, slower at 100
                time: r.best_lap_time,
                date,
                dateLabel: this.formatDateShort(date)
            };
        });

        const points = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

        // Area polygon - close at bottom (y=100)
        const areaPoints = `0,100 ${points} 100,100`;

        // Generate Y-axis scale labels (4-5 evenly distributed labels)
        const yScaleLabels: { value: string, position: number }[] = [];
        const numLabels = 5; // Show 5 labels (top, 3 middle, bottom)

        for (let i = 0; i < numLabels; i++) {
            const fraction = i / (numLabels - 1);
            const currentTime = scaleMin + (scaleRange * fraction);
            const normalized = (currentTime - scaleMin) / scaleRange;
            const svgY = 100 - (normalized * 100); // SVG: faster at bottom

            yScaleLabels.push({
                value: this.secondsToTime(currentTime),
                position: svgY // For CSS top positioning
            });
        }

        // Generate X-axis labels
        const xLabels: { x: number, label: string }[] = [];
        if (dataPoints.length > 0) {
            xLabels.push({ x: dataPoints[0].x, label: dataPoints[0].dateLabel });

            if (dataPoints.length > 2) {
                const midIndex = Math.floor(dataPoints.length / 2);
                xLabels.push({ x: dataPoints[midIndex].x, label: dataPoints[midIndex].dateLabel });
            }

            if (dataPoints.length > 1) {
                const lastIndex = dataPoints.length - 1;
                xLabels.push({ x: dataPoints[lastIndex].x, label: dataPoints[lastIndex].dateLabel });
            }
        }

        return {
            points,
            areaPoints,
            dataPoints,
            yScale: { labels: yScaleLabels },
            xLabels,
            scaleMin,
            scaleMax
        };
    }

    secondsToTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60); // No decimals, just whole seconds
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    formatDateShort(date: Date): string {
        const month = date.toLocaleString('en', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
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
