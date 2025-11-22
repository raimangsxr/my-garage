import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

export interface MaintenanceItem {
    id: number;
    date: string;
    description: string;
    cost: number;
}

@Component({
    selector: 'app-maintenance-timeline',
    standalone: true,
    imports: [CommonModule, MatIconModule, EmptyStateComponent],
    templateUrl: './maintenance-timeline.component.html',
    styleUrls: ['./maintenance-timeline.component.scss']
})
export class MaintenanceTimelineComponent {
    @Input() maintenances: MaintenanceItem[] = [];
    @Output() maintenanceClick = new EventEmitter<MaintenanceItem>();

    onMaintenanceClick(maintenance: MaintenanceItem): void {
        this.maintenanceClick.emit(maintenance);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}
