import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        RouterModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    stats: DashboardStats | null = null;
    loading = true;
    error: string | null = null;

    constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.loading = true;
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading dashboard stats:', err);
                this.error = 'Failed to load dashboard data';
                this.loading = false;
            }
        });
    }

    getMaxMonthlyCost(): number {
        if (!this.stats?.monthly_costs.length) return 0;
        return Math.max(...this.stats.monthly_costs.map(m => m.cost));
    }

    getBarHeight(cost: number): number {
        const max = this.getMaxMonthlyCost();
        return max > 0 ? (cost / max) * 100 : 0;
    }
}
