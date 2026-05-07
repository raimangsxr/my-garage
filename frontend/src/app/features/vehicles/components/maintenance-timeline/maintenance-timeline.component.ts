import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Maintenance } from '../../../../core/services/maintenance.service';

@Component({
    selector: 'app-maintenance-timeline',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        EmptyStateComponent
    ],
    templateUrl: './maintenance-timeline.component.html',
    styleUrls: ['./maintenance-timeline.component.scss']
})
export class MaintenanceTimelineComponent {
    @Input() maintenances: Maintenance[] = [];
    @Output() maintenanceClick = new EventEmitter<Maintenance>();
    @ViewChild('searchInput') searchInput?: ElementRef;

    isSearchMode = false;
    searchQuery = '';

    get displayMaintenances(): Maintenance[] {
        if (!this.searchQuery.trim()) {
            return this.maintenances;
        }
        const query = this.searchQuery.toLowerCase();
        return this.maintenances.filter(m =>
            m.description.toLowerCase().includes(query)
        );
    }

    toggleSearchMode() {
        this.isSearchMode = !this.isSearchMode;
        if (this.isSearchMode) {
            setTimeout(() => {
                this.searchInput?.nativeElement.focus();
            });
        } else {
            this.searchQuery = '';
        }
    }

    onMaintenanceClick(maintenance: Maintenance): void {
        this.maintenanceClick.emit(maintenance);
    }

    onMaintenanceKeydown(event: Event, maintenance: Maintenance): void {
        event.preventDefault();
        this.onMaintenanceClick(maintenance);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}
