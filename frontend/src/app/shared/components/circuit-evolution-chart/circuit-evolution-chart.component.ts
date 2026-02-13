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
    x: number;
    y: number;
    time: string;
    timeSeconds: number;
    date: Date;
    dateLabel: string;
    seriesName: string;
    seriesColor: string;
    seriesIndex: number;
    weatherConditions?: string;
    tireCompound?: string;
    group?: string;
    organizer?: string;
}

interface ProcessedSeries {
    name: string;
    color: string;
    points: ChartPoint[];
    sessionPolyline: string;
    recordStepPolyline: string;
    recordPoints: ChartPoint[];
    bestSeconds: number;
    firstSeconds: number;
}

interface AbsoluteRecord {
    time: string;
    timeSeconds: number;
    date: Date;
    dateLabel: string;
    seriesName: string;
    seriesColor: string;
    y: number;
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

    processedSeries: ProcessedSeries[] = [];
    yAxisLabels: { value: string; position: number }[] = [];
    xAxisLabels: { label: string; position: number }[] = [];
    absoluteRecord: AbsoluteRecord | null = null;

    visibleSeries = new Set<string>();
    focusSeriesName: string | null = null;
    viewMode: 'record' | 'session' | 'both' = 'both';

    private minTime = 0;
    private maxTime = 0;
    private minDate = 0;
    private maxDate = 0;

    hoverPoint: ChartPoint | null = null;
    lockedPoint: ChartPoint | null = null;

    get selectedPoint(): ChartPoint | null {
        return this.lockedPoint || this.hoverPoint;
    }

    get renderedSeries(): ProcessedSeries[] {
        return this.processedSeries.filter(series => this.visibleSeries.has(series.name));
    }

    get renderedPoints(): ChartPoint[] {
        if (this.viewMode === 'record') {
            return this.renderedSeries.flatMap(series => series.recordPoints);
        }
        return this.renderedSeries.flatMap(series => series.points);
    }

    get fastestSeries(): ProcessedSeries | null {
        if (!this.renderedSeries.length) {
            return null;
        }
        return [...this.renderedSeries].sort((a, b) => a.bestSeconds - b.bestSeconds)[0];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.processData();
        }
    }

    isSeriesVisible(name: string): boolean {
        return this.visibleSeries.has(name);
    }

    toggleSeries(name: string): void {
        if (this.visibleSeries.has(name)) {
            if (this.visibleSeries.size === 1) {
                return;
            }
            this.visibleSeries.delete(name);
        } else {
            this.visibleSeries.add(name);
        }

        if (this.selectedPoint && !this.visibleSeries.has(this.selectedPoint.seriesName)) {
            this.lockedPoint = null;
            this.hoverPoint = null;
        }

        this.generateXAxisLabels();
    }

    isolateSeries(name: string, event: MouseEvent): void {
        event.stopPropagation();
        this.visibleSeries = new Set([name]);
        this.focusSeriesName = name;

        if (this.selectedPoint && this.selectedPoint.seriesName !== name) {
            this.lockedPoint = null;
            this.hoverPoint = null;
        }

        this.generateXAxisLabels();
    }

    resetSeriesVisibility(): void {
        this.visibleSeries = new Set(this.processedSeries.map(series => series.name));
        this.focusSeriesName = null;
        this.generateXAxisLabels();
    }

    setViewMode(mode: 'record' | 'session' | 'both'): void {
        this.viewMode = mode;
    }

    onLegendEnter(name: string): void {
        this.focusSeriesName = name;
    }

    onLegendLeave(): void {
        if (!this.lockedPoint) {
            this.focusSeriesName = null;
        }
    }

    onMarkerEnter(point: ChartPoint): void {
        this.hoverPoint = point;
        this.focusSeriesName = point.seriesName;
    }

    onMarkerLeave(point: ChartPoint): void {
        if (this.hoverPoint === point) {
            this.hoverPoint = null;
        }
        if (!this.lockedPoint) {
            this.focusSeriesName = null;
        }
    }

    onMarkerClick(point: ChartPoint, event: MouseEvent): void {
        event.stopPropagation();
        this.lockedPoint = this.lockedPoint === point ? null : point;
        this.hoverPoint = null;
        this.focusSeriesName = this.lockedPoint ? this.lockedPoint.seriesName : null;
    }

    onChartClick(): void {
        this.lockedPoint = null;
        this.hoverPoint = null;
        this.focusSeriesName = null;
    }

    isSeriesDimmed(seriesName: string): boolean {
        return this.focusSeriesName !== null && this.focusSeriesName !== seriesName;
    }

    getImprovementLabel(series: ProcessedSeries): string {
        const delta = series.firstSeconds - series.bestSeconds;
        if (delta <= 0) {
            return '0.000s';
        }
        return `${delta.toFixed(3)}s`;
    }

    getSelectedVsAbsoluteDelta(): number | null {
        if (!this.selectedPoint || !this.absoluteRecord) {
            return null;
        }
        return this.selectedPoint.timeSeconds - this.absoluteRecord.timeSeconds;
    }

    formatRelativeDelta(delta: number): string {
        if (!Number.isFinite(delta)) {
            return '0.000';
        }
        const sign = delta > 0 ? '+' : '';
        return `${sign}${delta.toFixed(3)}`;
    }

    private processData(): void {
        if (!this.data || this.data.length === 0) {
            this.processedSeries = [];
            this.yAxisLabels = [];
            this.xAxisLabels = [];
            this.absoluteRecord = null;
            this.visibleSeries.clear();
            return;
        }

        const allTimes: number[] = [];
        const allDates: number[] = [];
        let absoluteCandidate: Omit<AbsoluteRecord, 'y' | 'dateLabel'> | null = null;

        for (const series of this.data) {
            for (const record of series.records) {
                const seconds = this.timeToSeconds(record.best_lap_time);
                const date = new Date(record.date_achieved);
                if (Number.isFinite(seconds)) {
                    allTimes.push(seconds);
                }
                if (Number.isFinite(date.getTime())) {
                    allDates.push(date.getTime());
                }

                if (!Number.isFinite(seconds) || !Number.isFinite(date.getTime())) {
                    return;
                }

                if (!absoluteCandidate || seconds < absoluteCandidate.timeSeconds) {
                    absoluteCandidate = {
                        time: record.best_lap_time,
                        timeSeconds: seconds,
                        date,
                        seriesName: series.name,
                        seriesColor: series.color
                    };
                }
            }
        }

        if (allTimes.length === 0 || allDates.length === 0) {
            this.processedSeries = [];
            this.absoluteRecord = null;
            return;
        }

        const minRaw = Math.min(...allTimes);
        const maxRaw = Math.max(...allTimes);
        const timePadding = Math.max(0.5, (maxRaw - minRaw) * 0.12);
        this.minTime = Math.max(0, minRaw - timePadding);
        this.maxTime = maxRaw + timePadding;

        this.minDate = Math.min(...allDates);
        this.maxDate = Math.max(...allDates);
        const dateRange = this.maxDate - this.minDate;
        const datePadding = Math.max(1, dateRange * 0.04);
        this.minDate -= datePadding;
        this.maxDate += datePadding;

        this.processedSeries = this.data
            .filter(series => series.records.length > 0)
            .map((series, seriesIndex) => {
                const dailyBestRecords = this.getDailyBestRecords(series.records);

                const points: ChartPoint[] = dailyBestRecords.map(record => {
                    const timeSeconds = record.timeSeconds;
                    const date = record.date;

                    return {
                        x: this.calculateXPosition(date.getTime()),
                        y: this.calculateYPosition(timeSeconds),
                        time: record.bestLapTime,
                        timeSeconds,
                        date,
                        dateLabel: this.formatDate(date),
                        seriesName: series.name,
                        seriesColor: series.color,
                        seriesIndex,
                        weatherConditions: record.weatherConditions,
                        tireCompound: record.tireCompound,
                        group: record.group,
                        organizer: record.organizer
                    };
                });

                const sessionPolyline = points.map(p => `${p.x},${p.y}`).join(' ');
                const recordPoints = this.extractRecordPoints(points);
                const recordStepPolyline = this.buildStepPolyline(points);

                const firstSeconds = points[0]?.timeSeconds ?? 0;
                const bestSeconds = Math.min(...points.map(p => p.timeSeconds));

                return {
                    name: series.name,
                    color: series.color,
                    points,
                    sessionPolyline,
                    recordStepPolyline,
                    recordPoints,
                    bestSeconds,
                    firstSeconds
                };
            });

        const currentVisible = new Set(this.visibleSeries);
        this.visibleSeries = new Set(
            this.processedSeries
                .map(series => series.name)
                .filter(name => currentVisible.size === 0 || currentVisible.has(name))
        );

        if (this.visibleSeries.size === 0) {
            this.visibleSeries = new Set(this.processedSeries.map(series => series.name));
        }

        if (absoluteCandidate) {
            this.absoluteRecord = {
                time: absoluteCandidate.time,
                timeSeconds: absoluteCandidate.timeSeconds,
                date: absoluteCandidate.date,
                seriesName: absoluteCandidate.seriesName,
                seriesColor: absoluteCandidate.seriesColor,
                y: this.calculateYPosition(absoluteCandidate.timeSeconds),
                dateLabel: this.formatDate(absoluteCandidate.date)
            };
        } else {
            this.absoluteRecord = null;
        }

        this.generateYAxisLabels();
        this.generateXAxisLabels();
    }

    private extractRecordPoints(points: ChartPoint[]): ChartPoint[] {
        const milestones: ChartPoint[] = [];
        let currentBest = Number.POSITIVE_INFINITY;

        points.forEach(point => {
            if (point.timeSeconds < currentBest) {
                milestones.push(point);
                currentBest = point.timeSeconds;
            }
        });

        return milestones;
    }

    private buildStepPolyline(points: ChartPoint[]): string {
        if (!points.length) {
            return '';
        }

        const coords: string[] = [];
        let currentBestY = points[0].y;
        let currentBestSeconds = points[0].timeSeconds;

        coords.push(`${points[0].x},${currentBestY}`);

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            coords.push(`${point.x},${currentBestY}`);

            if (point.timeSeconds < currentBestSeconds) {
                currentBestSeconds = point.timeSeconds;
                currentBestY = point.y;
                coords.push(`${point.x},${currentBestY}`);
            }
        }

        return coords.join(' ');
    }

    private getDailyBestRecords(records: ChartRecord[]): {
        date: Date;
        bestLapTime: string;
        timeSeconds: number;
        weatherConditions?: string;
        tireCompound?: string;
        group?: string;
        organizer?: string;
    }[] {
        const dailyBest = new Map<string, {
            date: Date;
            bestLapTime: string;
            timeSeconds: number;
            weatherConditions?: string;
            tireCompound?: string;
            group?: string;
            organizer?: string;
        }>();

        records.forEach(record => {
            const date = new Date(record.date_achieved);
            const timeSeconds = this.timeToSeconds(record.best_lap_time);
            if (!Number.isFinite(date.getTime()) || !Number.isFinite(timeSeconds)) {
                return;
            }

            const key = this.dateKey(date);
            const existing = dailyBest.get(key);
            if (!existing || timeSeconds < existing.timeSeconds) {
                dailyBest.set(key, {
                    date,
                    bestLapTime: record.best_lap_time,
                    timeSeconds,
                    weatherConditions: this.normalizeOptional(record['weather_conditions']),
                    tireCompound: this.normalizeOptional(record['tire_compound']),
                    group: this.normalizeOptional(record['group']),
                    organizer: this.normalizeOptional(record['organizer'])
                });
            }
        });

        return [...dailyBest.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    private dateKey(date: Date): string {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private normalizeOptional(value: unknown): string | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed ? trimmed : undefined;
    }

    private calculateXPosition(dateMs: number): number {
        if (this.maxDate === this.minDate) {
            return 50;
        }
        return ((dateMs - this.minDate) / (this.maxDate - this.minDate)) * 100;
    }

    private calculateYPosition(timeSeconds: number): number {
        if (this.maxTime === this.minTime) {
            return 50;
        }
        const normalized = (timeSeconds - this.minTime) / (this.maxTime - this.minTime);
        return (1 - normalized) * 100;
    }

    private generateYAxisLabels(): void {
        this.yAxisLabels = [];
        const labelCount = 5;
        const range = this.maxTime - this.minTime;

        for (let i = 0; i < labelCount; i++) {
            const fraction = i / (labelCount - 1);
            this.yAxisLabels.push({
                value: this.secondsToTime(this.minTime + (range * fraction)),
                position: (1 - fraction) * 100
            });
        }
    }

    private generateXAxisLabels(): void {
        this.xAxisLabels = [];

        const visiblePoints = this.renderedSeries.flatMap(series => series.points);
        if (!visiblePoints.length) {
            return;
        }

        const uniqueDates = new Map<string, { date: Date; position: number }>();
        visiblePoints.forEach(point => {
            const key = point.date.toISOString().slice(0, 10);
            if (!uniqueDates.has(key)) {
                uniqueDates.set(key, {
                    date: point.date,
                    position: this.calculateXPosition(point.date.getTime())
                });
            }
        });

        const sorted = [...uniqueDates.values()].sort((a, b) => a.position - b.position);
        if (sorted.length <= 3) {
            this.xAxisLabels = sorted.map(item => ({
                label: this.formatDate(item.date),
                position: item.position
            }));
            return;
        }

        const first = sorted[0];
        const mid = sorted[Math.floor(sorted.length / 2)];
        const last = sorted[sorted.length - 1];

        this.xAxisLabels = [
            { label: this.formatDate(first.date), position: first.position },
            { label: this.formatDate(mid.date), position: mid.position },
            { label: this.formatDate(last.date), position: last.position }
        ];
    }

    private timeToSeconds(timeStr: string): number {
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
        }
        return parseFloat(parts[0]);
    }

    secondsToTime(seconds: number): string {
        const safe = Math.max(0, seconds);
        const m = Math.floor(safe / 60);
        const s = safe - (m * 60);
        return `${m}:${s.toFixed(3).padStart(6, '0')}`;
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    }
}
