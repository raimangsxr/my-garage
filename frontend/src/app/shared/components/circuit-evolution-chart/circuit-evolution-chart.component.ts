import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ChartRecord {
    best_lap_time: string;
    date_achieved: string;
    [key: string]: any;
}

export interface ChartSeries {
    name: string;
    color: string;
    records: ChartRecord[];
}

interface ChartPoint {
    x: number;           // X position (0-100%)
    y: number;           // Y position (0-100%)
    time: string;        // Original time string
    timeSeconds: number; // Time in seconds for calculations
    date: Date;          // Date object
    dateLabel: string;   // Formatted date label
    seriesName: string;  // Vehicle name
    seriesColor: string; // Series color
    seriesIndex: number; // Series index
}

interface ProcessedSeries {
    name: string;
    color: string;
    points: ChartPoint[];
    polylinePoints: string;
}

@Component({
    selector: 'app-circuit-evolution-chart',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './circuit-evolution-chart.component.html',
    styleUrls: ['./circuit-evolution-chart.component.scss']
})
export class CircuitEvolutionChartComponent implements OnChanges {
    @Input() data: ChartSeries[] = [];
    @Input() height: string = '300px';

    // Processed data
    processedSeries: ProcessedSeries[] = [];
    allPoints: ChartPoint[] = [];
    yAxisLabels: { value: string; position: number }[] = [];
    xAxisLabels: { label: string; position: number }[] = [];

    // Scale bounds
    private minTime = 0;
    private maxTime = 0;
    private minDate = 0;
    private maxDate = 0;

    // Tooltip state
    hoverPoint: ChartPoint | null = null;
    lockedPoint: ChartPoint | null = null;

    get selectedPoint(): ChartPoint | null {
        return this.lockedPoint || this.hoverPoint;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.processData();
        }
    }

    // Interaction methods
    onMarkerEnter(point: ChartPoint): void {
        this.hoverPoint = point;
    }

    onMarkerLeave(point: ChartPoint): void {
        if (this.hoverPoint === point) {
            this.hoverPoint = null;
        }
    }

    onMarkerClick(point: ChartPoint, event: MouseEvent): void {
        event.stopPropagation();
        // Toggle lock if clicking the same point, otherwise lock new point
        this.lockedPoint = this.lockedPoint === point ? null : point;
        // clear hover to prevent "sticking" if we move mouse away after unlock
        this.hoverPoint = null;
    }

    onChartClick(event: MouseEvent): void {
        // Clear lock on background click
        this.lockedPoint = null;
    }

    private processData(): void {
        if (!this.data || this.data.length === 0) {
            this.processedSeries = [];
            this.allPoints = [];
            this.yAxisLabels = [];
            this.xAxisLabels = [];
            return;
        }

        // Collect all times and dates for scale calculation
        const allTimes: number[] = [];
        const allDates: number[] = [];

        this.data.forEach(series => {
            series.records.forEach(record => {
                allTimes.push(this.timeToSeconds(record.best_lap_time));
                allDates.push(new Date(record.date_achieved).getTime());
            });
        });

        if (allTimes.length === 0) return;

        // Calculate scales with padding
        this.minTime = Math.min(...allTimes) - 2; // 2 seconds padding below
        this.maxTime = Math.max(...allTimes) + 2; // 2 seconds padding above
        this.minDate = Math.min(...allDates);
        this.maxDate = Math.max(...allDates);

        // Add date padding (5% on each side)
        const dateRange = this.maxDate - this.minDate;
        const datePadding = dateRange * 0.05;
        this.minDate -= datePadding;
        this.maxDate += datePadding;

        // Process each series
        this.processedSeries = [];
        this.allPoints = [];

        this.data.forEach((series, seriesIndex) => {
            const sortedRecords = [...series.records].sort((a, b) =>
                new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime()
            );

            const points: ChartPoint[] = sortedRecords.map(record => {
                const timeSeconds = this.timeToSeconds(record.best_lap_time);
                const dateMs = new Date(record.date_achieved).getTime();

                // Calculate positions (0-100)
                const x = this.calculateXPosition(dateMs);
                const y = this.calculateYPosition(timeSeconds);

                return {
                    x,
                    y,
                    time: record.best_lap_time,
                    timeSeconds,
                    date: new Date(record.date_achieved),
                    dateLabel: this.formatDate(new Date(record.date_achieved)),
                    seriesName: series.name,
                    seriesColor: series.color,
                    seriesIndex
                };
            });

            // Generate polyline points string
            const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

            this.processedSeries.push({
                name: series.name,
                color: series.color,
                points,
                polylinePoints
            });

            this.allPoints.push(...points);
        });

        this.generateYAxisLabels();
        this.generateXAxisLabels();
    }

    private calculateXPosition(dateMs: number): number {
        if (this.maxDate === this.minDate) return 50;
        return ((dateMs - this.minDate) / (this.maxDate - this.minDate)) * 100;
    }

    private calculateYPosition(timeSeconds: number): number {
        if (this.maxTime === this.minTime) return 50;
        // Invert Y-axis: Faster times (lower seconds) at BOTTOM (100%)
        // Slowest times (higher seconds) at TOP (0%)
        const normalized = (timeSeconds - this.minTime) / (this.maxTime - this.minTime);
        return (1 - normalized) * 100;
    }

    private generateYAxisLabels(): void {
        this.yAxisLabels = [];
        const numLabels = 5;
        const range = this.maxTime - this.minTime;

        for (let i = 0; i < numLabels; i++) {
            const fraction = i / (numLabels - 1);
            const timeValue = this.minTime + (range * fraction);

            // Inverted position: 0 (Fastest) -> 100% (Bottom)
            const position = (1 - fraction) * 100;

            this.yAxisLabels.push({
                value: this.secondsToTime(timeValue),
                position
            });
        }
    }

    private generateXAxisLabels(): void {
        this.xAxisLabels = [];

        // Get unique dates with their positions, sorted by date
        const datePositions: { date: Date; position: number }[] = [];
        const seenDates = new Set<string>();

        this.allPoints.forEach(p => {
            const dateStr = p.date.toDateString();
            if (!seenDates.has(dateStr)) {
                seenDates.add(dateStr);
                datePositions.push({
                    date: p.date,
                    position: this.calculateXPosition(p.date.getTime())
                });
            }
        });

        // Sort by position
        datePositions.sort((a, b) => a.position - b.position);

        // Minimum spacing between labels (in percentage)
        const minSpacing = 15;
        const filteredPositions: { date: Date; position: number }[] = [];

        datePositions.forEach(dp => {
            // Check if this label is far enough from all existing labels
            const isFarEnough = filteredPositions.every(
                existing => Math.abs(existing.position - dp.position) >= minSpacing
            );
            if (isFarEnough) {
                filteredPositions.push(dp);
            }
        });

        // Generate labels from filtered positions
        filteredPositions.forEach(dp => {
            this.xAxisLabels.push({
                label: this.formatDate(dp.date),
                position: dp.position
            });
        });
    }

    private timeToSeconds(timeStr: string): number {
        try {
            const parts = timeStr.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
            }
            return parseFloat(parts[0]);
        } catch {
            return 0;
        }
    }

    private secondsToTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
}
