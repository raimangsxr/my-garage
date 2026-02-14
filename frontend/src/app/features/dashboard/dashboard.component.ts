import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from './dashboard.service';
import { LoggerService } from '../../core/services/logger.service';
import { Subscription } from 'rxjs';
import { PageLoaderComponent } from '../../shared/components/page-loader/page-loader.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        PageLoaderComponent,
        RouterModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
    stats: DashboardStats | null = null;
    monthlyCostsWithHeight: Array<{ month: string; cost: number; barHeight: number }> = [];
    loading = true;
    error: string | null = null;

    private dashboardService = inject(DashboardService);
    private logger = inject(LoggerService);
    private cdr = inject(ChangeDetectorRef);
    private subscriptions = new Subscription();

    ngOnInit(): void {
        this.loadStats();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    loadStats(): void {
        this.loading = true;
        this.subscriptions.add(
            this.dashboardService.getStats().subscribe({
                next: (data) => {
                    this.stats = data;
                    this.monthlyCostsWithHeight = this.buildMonthlyCostsWithHeight(data);
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.logger.error('Error loading dashboard stats', err);
                    this.error = 'Failed to load dashboard data';
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            })
        );
    }

    trackByMonth(_: number, item: { month: string }): string {
        return item.month;
    }

    trackByActivityId(_: number, item: { id: number }): number {
        return item.id;
    }

    trackByCircuitName(_: number, item: { circuit_name: string }): string {
        return item.circuit_name;
    }

    private buildMonthlyCostsWithHeight(
        stats: DashboardStats
    ): Array<{ month: string; cost: number; barHeight: number }> {
        const monthlyCosts = stats.monthly_costs ?? [];
        const maxCost = monthlyCosts.length ? Math.max(...monthlyCosts.map(item => item.cost)) : 0;

        return monthlyCosts.map(item => ({
            month: item.month,
            cost: item.cost,
            barHeight: maxCost > 0 ? (item.cost / maxCost) * 100 : 0,
        }));
    }
}
