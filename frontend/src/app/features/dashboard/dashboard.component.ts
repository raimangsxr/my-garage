import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    stats = [
        { title: 'Total Vehicles', value: '12', icon: 'directions_car', color: 'primary' },
        { title: 'Active Maintenance', value: '3', icon: 'build', color: 'accent' },
        { title: 'Pending Invoices', value: '5', icon: 'receipt', color: 'warn' },
        { title: 'Suppliers', value: '8', icon: 'store', color: 'primary' }
    ];
}
