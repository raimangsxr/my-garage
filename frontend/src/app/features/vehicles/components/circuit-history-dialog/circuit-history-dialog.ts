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
    selectedPointIndex: number | null = null;
    selectedPointType: 'session' | 'record' = 'record';
    showSessionTrend = true;

    selectPoint(index: number, type: 'session' | 'record' = 'record'): void {
        this.selectedPointType = type;
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

    get recordsByDate(): TrackRecord[] {
        return [...this.data.records].sort((a, b) =>
            new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime()
        );
    }

    get chartData(): {
        hasEnoughData: boolean,
        yScale: { labels: { value: string, position: number }[] },
        xLabels: { x: number, label: string }[],
        sessionLine: string,
        recordStepLine: string,
        recordArea: string,
        sessionPoints: {
            record: TrackRecord,
            x: number,
            y: number,
            xPercent: number,
            yPercent: number,
            dateLabel: string,
            seconds: number,
            improvementFromPrevious?: number | null
        }[],
        recordPoints: {
            record: TrackRecord,
            x: number,
            y: number,
            xPercent: number,
            yPercent: number,
            dateLabel: string,
            seconds: number,
            improvementFromPrevious: number | null
        }[],
        firstTime: number | null,
        bestTime: number | null
    } {
        const records = this.recordsByDate;
        if (records.length < 2) {
            return {
                hasEnoughData: false,
                yScale: { labels: [] },
                xLabels: [],
                sessionLine: '',
                recordStepLine: '',
                recordArea: '',
                sessionPoints: [],
                recordPoints: [],
                firstTime: null,
                bestTime: null
            };
        }

        const sessionSeconds = records.map(r => this.timeToSeconds(r.best_lap_time));
        const minSession = Math.min(...sessionSeconds);
        const maxSession = Math.max(...sessionSeconds);
        const margin = Math.max(0.8, (maxSession - minSession) * 0.12);
        const scaleMin = Math.max(0, minSession - margin);
        const scaleMax = maxSession + margin;
        const scaleRange = Math.max(0.001, scaleMax - scaleMin);

        const sessionPoints = records.map((record, index) => {
            const x = (index / (records.length - 1)) * 100;
            const seconds = this.timeToSeconds(record.best_lap_time);
            const y = ((seconds - scaleMin) / scaleRange) * 100;
            return {
                record,
                x,
                y,
                xPercent: x,
                yPercent: y,
                dateLabel: this.formatDateShort(new Date(record.date_achieved)),
                seconds,
                improvementFromPrevious: null
            };
        });

        const recordPoints: {
            record: TrackRecord,
            x: number,
            y: number,
            xPercent: number,
            yPercent: number,
            dateLabel: string,
            seconds: number,
            improvementFromPrevious: number | null
        }[] = [];
        let currentBest = Number.POSITIVE_INFINITY;

        sessionPoints.forEach(point => {
            if (point.seconds < currentBest) {
                recordPoints.push({
                    ...point,
                    improvementFromPrevious: Number.isFinite(currentBest) ? currentBest - point.seconds : null
                });
                currentBest = point.seconds;
            }
        });

        const sessionLine = sessionPoints.map(p => `${p.x},${p.y}`).join(' ');
        const recordStepLine = this.buildRecordStepLine(sessionPoints);
        const recordArea = this.buildRecordArea(sessionPoints);

        const yScaleLabels: { value: string, position: number }[] = [];
        const labelCount = 5;
        for (let i = 0; i < labelCount; i++) {
            const ratio = i / (labelCount - 1);
            const value = scaleMin + (scaleRange * ratio);
            yScaleLabels.push({
                value: this.secondsToTimeWithMillis(value),
                position: ratio * 100
            });
        }

        const xLabels = this.buildXAxisLabels(sessionPoints);

        return {
            hasEnoughData: true,
            yScale: { labels: yScaleLabels },
            xLabels,
            sessionLine,
            recordStepLine,
            recordArea,
            sessionPoints,
            recordPoints,
            firstTime: sessionPoints[0]?.seconds ?? null,
            bestTime: currentBest !== Number.POSITIVE_INFINITY ? currentBest : null
        };
    }

    get selectedPoint() {
        const data = this.chartData;
        if (this.selectedPointIndex === null) {
            return data.recordPoints[data.recordPoints.length - 1] ?? null;
        }
        if (this.selectedPointType === 'record') {
            return data.recordPoints[this.selectedPointIndex] ?? null;
        }
        return data.sessionPoints[this.selectedPointIndex] ?? null;
    }

    get totalImprovementLabel(): string | null {
        const data = this.chartData;
        if (data.firstTime === null || data.bestTime === null) {
            return null;
        }
        const improvement = data.firstTime - data.bestTime;
        if (improvement <= 0) {
            return null;
        }
        return this.formatDelta(improvement);
    }

    toggleSessionTrend(): void {
        this.showSessionTrend = !this.showSessionTrend;
    }

    secondsToTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60); // No decimals, just whole seconds
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    secondsToTimeWithMillis(seconds: number): string {
        if (!Number.isFinite(seconds)) {
            return '--:--.---';
        }
        const safeSeconds = Math.max(0, seconds);
        const minutes = Math.floor(safeSeconds / 60);
        const secs = safeSeconds - (minutes * 60);
        return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
    }

    formatDateShort(date: Date): string {
        const month = date.toLocaleString('en', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear().toString().slice(-2);
        return `${month} ${day} '${year}`;
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

    private buildXAxisLabels(points: { x: number, dateLabel: string }[]): { x: number, label: string }[] {
        if (points.length === 0) {
            return [];
        }
        if (points.length <= 3) {
            return points.map(p => ({ x: p.x, label: p.dateLabel }));
        }
        const first = points[0];
        const mid = points[Math.floor(points.length / 2)];
        const last = points[points.length - 1];
        return [
            { x: first.x, label: first.dateLabel },
            { x: mid.x, label: mid.dateLabel },
            { x: last.x, label: last.dateLabel }
        ];
    }

    private buildRecordStepLine(points: { x: number, y: number }[]): string {
        if (points.length === 0) {
            return '';
        }
        const coordinates: string[] = [];
        let runningBest = Number.POSITIVE_INFINITY;
        let previousX = points[0].x;
        let previousY = points[0].y;

        points.forEach((point, index) => {
            const isImprovement = point.y < runningBest || index === 0;
            if (index === 0) {
                coordinates.push(`${point.x},${point.y}`);
                runningBest = point.y;
                return;
            }

            coordinates.push(`${point.x},${previousY}`);

            if (isImprovement && point.y !== previousY) {
                coordinates.push(`${point.x},${point.y}`);
                previousY = point.y;
            }

            previousX = point.x;
            runningBest = Math.min(runningBest, point.y);
        });

        if (previousX < 100) {
            coordinates.push(`100,${previousY}`);
        }

        return coordinates.join(' ');
    }

    private buildRecordArea(points: { x: number, y: number }[]): string {
        const stepLine = this.buildRecordStepLine(points);
        if (!stepLine) {
            return '';
        }
        return `0,100 ${stepLine} 100,100`;
    }

    private formatDelta(seconds: number): string {
        const millis = Math.round(seconds * 1000);
        const sign = millis >= 0 ? '-' : '+';
        const abs = Math.abs(millis);
        const secs = (abs / 1000).toFixed(3);
        return `${sign}${secs}s`;
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
