import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

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
    imports: [CommonModule, NgxChartsModule],
    templateUrl: './circuit-evolution-chart.component.html',
    styleUrls: ['./circuit-evolution-chart.component.scss']
})
export class CircuitEvolutionChartComponent implements OnChanges {
    @Input() data: ChartSeries[] = [];
    @Input() height: string = '300px';

    // NGX-Charts data
    chartResults: any[] = [];

    // Options
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = false;
    showXAxisLabel = true;
    xAxisLabel = 'Session';
    showYAxisLabel = true;
    yAxisLabel = 'Lap Time';
    autoScale = true;
    timeline = false;

    // Color scheme
    colorScheme: Color = {
        name: 'custom',
        selectable: true,
        group: ScaleType.Ordinal,
        domain: []
    };

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.processData();
        }
    }

    private processData(): void {
        if (!this.data || this.data.length === 0) {
            this.chartResults = [];
            return;
        }

        this.colorScheme = {
            ...this.colorScheme,
            domain: this.data.map(s => s.color)
        };

        this.chartResults = this.data.map(series => {
            // Sort records by date
            const sortedRecords = [...series.records].sort((a, b) =>
                new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime()
            );

            return {
                name: series.name,
                series: sortedRecords.map((record, index) => ({
                    name: (index + 1).toString(), // Session number as string
                    value: this.timeToSeconds(record.best_lap_time),
                    extra: {
                        date: record.date_achieved,
                        timeStr: record.best_lap_time
                    }
                }))
            };
        });
    }

    // Axis formatters
    formatYAxis(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.round((seconds % 1) * 1000); // Optional: milliseconds
        return `${m}:${s.toString().padStart(2, '0')}`;
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
}
