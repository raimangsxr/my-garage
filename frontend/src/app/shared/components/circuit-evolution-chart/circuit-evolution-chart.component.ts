import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ChartRecord {
    best_lap_time: string;
    date_achieved: string;
    [key: string]: any; // Allow other properties
}

export interface ChartSeries {
    name: string;
    color: string;
    records: ChartRecord[];
}

interface ChartPoint {
    x: number;
    y: number;
    xPercent: number;
    yPercent: number;
    time: string;
    timeSeconds: number;
    date: Date;
    dateLabel: string;
    record: ChartRecord;
    seriesIndex: number;
    seriesName: string;
    seriesColor: string;
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

    chartData: {
        seriesPoints: { points: string, color: string, areaPoints: string }[],
        allPoints: ChartPoint[],
        yScale: { labels: { value: string, position: number }[] },
        xLabels: { x: number, label: string }[],
        scaleMin: number,
        scaleMax: number
    } = {
            seriesPoints: [],
            allPoints: [],
            yScale: { labels: [] },
            xLabels: [],
            scaleMin: 0,
            scaleMax: 0
        };

    selectedPoint: ChartPoint | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.calculateChartData();
        }
    }

    selectPoint(point: ChartPoint): void {
        this.selectedPoint = this.selectedPoint === point ? null : point;
    }

    private calculateChartData(): void {
        if (!this.data || this.data.length === 0) return;

        // 1. Collect all times to determine Y-axis scale
        let allTimes: number[] = [];
        let maxSessions = 0;

        this.data.forEach(series => {
            const seriesTimes = series.records.map(r => this.timeToSeconds(r.best_lap_time));
            allTimes = [...allTimes, ...seriesTimes];
            if (series.records.length > maxSessions) {
                maxSessions = series.records.length;
            }
        });

        if (allTimes.length === 0) return;

        const minTime = Math.min(...allTimes);
        const maxTime = Math.max(...allTimes);

        // Fixed scale: 1 second below best (faster), 1 second above worst (slower)
        // Adjust padding as needed
        const scaleMin = Math.max(0, minTime - 1);
        const scaleMax = maxTime + 1;
        const scaleRange = scaleMax - scaleMin;

        // 2. Generate points for each series
        const seriesPoints: { points: string, color: string, areaPoints: string }[] = [];
        const allPoints: ChartPoint[] = [];

        this.data.forEach((series, seriesIndex) => {
            // Sort records by date to ensure correct evolution order
            const sortedRecords = [...series.records].sort((a, b) =>
                new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime()
            );

            const currentSeriesPoints: ChartPoint[] = sortedRecords.map((r, i) => {
                // X position based on session index (0 to maxSessions - 1)
                // If maxSessions is 1, place it in the middle (50%)
                const x = maxSessions > 1 ? (i / (maxSessions - 1)) * 100 : 50;

                const time = this.timeToSeconds(r.best_lap_time);

                // Y position: faster times (lower numbers) at BOTTOM (y=100), slower times (higher numbers) at TOP (y=0)
                const normalized = (time - scaleMin) / scaleRange;
                const y = 100 - (normalized * 100);

                const date = new Date(r.date_achieved);

                return {
                    x,
                    y,
                    xPercent: x,
                    yPercent: normalized * 100, // For HTML positioning (bottom-based)
                    time: r.best_lap_time,
                    timeSeconds: time,
                    date,
                    dateLabel: this.formatDateShort(date),
                    record: r,
                    seriesIndex,
                    seriesName: series.name,
                    seriesColor: series.color
                };
            });

            const pointsStr = currentSeriesPoints.map(p => `${p.x},${p.y}`).join(' ');
            // Area polygon - close at bottom (y=100)
            const areaPoints = `0,100 ${pointsStr} 100,100`; // This might need adjustment for multi-series to look good, maybe just line is better?
            // For multi-series, areas can overlap and look messy. Let's stick to lines or semi-transparent areas.
            // Let's try to make a closed shape for the area: start at first point bottom, go to first point, ..., last point, last point bottom.
            const firstX = currentSeriesPoints.length > 0 ? currentSeriesPoints[0].x : 0;
            const lastX = currentSeriesPoints.length > 0 ? currentSeriesPoints[currentSeriesPoints.length - 1].x : 0;
            const areaPoly = `${firstX},100 ${pointsStr} ${lastX},100`;

            seriesPoints.push({
                points: pointsStr,
                color: series.color,
                areaPoints: areaPoly
            });

            allPoints.push(...currentSeriesPoints);
        });

        // 3. Generate Y-axis labels
        const yScaleLabels: { value: string, position: number }[] = [];
        const numLabels = 5;

        for (let i = 0; i < numLabels; i++) {
            const fraction = i / (numLabels - 1);
            const currentTime = scaleMin + (scaleRange * fraction);
            const normalized = (currentTime - scaleMin) / scaleRange;
            const svgY = 100 - (normalized * 100);

            yScaleLabels.push({
                value: this.secondsToTime(currentTime),
                position: svgY
            });
        }

        // 4. Generate X-axis labels (Session numbers)
        const xLabels: { x: number, label: string }[] = [];
        if (maxSessions > 0) {
            // Show first, last, and maybe some in between
            // Actually, for "Evolution", maybe just show "Session 1", "Session 5", etc.
            // Or if it's date-based for a single vehicle, dates are fine.
            // But for multi-vehicle comparison, "Session N" is better.

            // Let's generate labels for Session 1, Session N/2, Session N
            if (maxSessions === 1) {
                xLabels.push({ x: 50, label: 'Session 1' });
            } else {
                xLabels.push({ x: 0, label: 'Start' });
                xLabels.push({ x: 100, label: 'Current' });
            }
        }

        this.chartData = {
            seriesPoints,
            allPoints,
            yScale: { labels: yScaleLabels },
            xLabels,
            scaleMin,
            scaleMax
        };
    }

    private timeToSeconds(timeStr: string): number {
        try {
            const parts = timeStr.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
            } else {
                return parseFloat(parts[0]);
            }
        } catch (e) {
            return 0;
        }
    }

    private secondsToTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    private formatDateShort(date: Date): string {
        const month = date.toLocaleString('en', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
    }
}
