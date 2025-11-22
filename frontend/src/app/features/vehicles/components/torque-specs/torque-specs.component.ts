import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

export interface TorqueSpec {
    component: string;
    torque_nm: number;
    notes?: string;
}

@Component({
    selector: 'app-torque-specs',
    standalone: true,
    imports: [CommonModule, MatIconModule, EmptyStateComponent],
    templateUrl: './torque-specs.component.html',
    styleUrls: ['./torque-specs.component.scss']
})
export class TorqueSpecsComponent {
    @Input() specs: TorqueSpec[] = [];

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
        return this.specs.length > 0 ? this.specs : this.defaultSpecs;
    }
}
