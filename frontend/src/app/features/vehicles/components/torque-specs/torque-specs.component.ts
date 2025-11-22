import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

export interface TorqueSpec {
    component: string;
    torque_nm: number;
    notes?: string;
}

@Component({
    selector: 'app-torque-specs',
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
    templateUrl: './torque-specs.component.html',
    styleUrls: ['./torque-specs.component.scss']
})
export class TorqueSpecsComponent {
    @Input() specs: TorqueSpec[] = [];
    @Output() saveSpecs = new EventEmitter<TorqueSpec[]>();

    isEditMode = false;
    isSearchMode = false;
    searchQuery = '';
    editedSpecs: TorqueSpec[] = [];

    // Common torque specifications for typical maintenance
    defaultSpecs: TorqueSpec[] = [
        { component: 'Wheel Nuts', torque_nm: 110, notes: 'Tighten in star pattern' },
        { component: 'Oil Drain Plug', torque_nm: 25, notes: 'Replace washer' },
        { component: 'Oil Filter', torque_nm: 20, notes: 'Hand tight + 3/4 turn' },
        { component: 'Spark Plugs', torque_nm: 25, notes: 'New plugs' },
        { component: 'Brake Caliper Bolts', torque_nm: 90 },
        { component: 'Engine Oil Cap', torque_nm: 5, notes: 'Hand tight' }
    ];

    get displaySpecs(): TorqueSpec[] {
        let specs = this.specs && this.specs.length > 0 ? this.specs : this.defaultSpecs;

        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            specs = specs.filter(spec =>
                spec.component.toLowerCase().includes(query) ||
                spec.notes?.toLowerCase().includes(query)
            );
        }

        return specs;
    }

    toggleSearchMode() {
        this.isSearchMode = !this.isSearchMode;
        if (!this.isSearchMode) {
            this.searchQuery = '';
        }
    }

    toggleEditMode() {
        if (this.isEditMode) {
            // Cancel
            this.isEditMode = false;
        } else {
            // Start editing
            // Copy current display specs to editedSpecs
            // Note: If filtering is active, we might want to edit ONLY visible or ALL?
            // Usually edit mode should show ALL specs to avoid confusion.
            // So let's clear search when entering edit mode.
            this.isSearchMode = false;
            this.searchQuery = '';

            // Use the full list (not filtered) for editing
            const sourceSpecs = this.specs && this.specs.length > 0 ? this.specs : this.defaultSpecs;
            this.editedSpecs = JSON.parse(JSON.stringify(sourceSpecs));
            this.isEditMode = true;
        }
    }

    save() {
        this.saveSpecs.emit(this.editedSpecs);
        this.isEditMode = false;
    }

    addSpec() {
        this.editedSpecs.push({ component: '', torque_nm: 0, notes: '' });
    }

    removeSpec(index: number) {
        this.editedSpecs.splice(index, 1);
    }
}
