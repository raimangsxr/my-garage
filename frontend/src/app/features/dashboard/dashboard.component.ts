import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    stats = [
        { title: 'Total Vehicles', value: '12', icon: 'directions_car', color: 'primary', link: '/vehicles' },
        { title: 'Active Maintenance', value: '3', icon: 'build', color: 'accent', link: '/maintenance' },
        { title: 'Pending Invoices', value: '5', icon: 'receipt', color: 'warn', link: '/invoices' },
        { title: 'Suppliers', value: '8', icon: 'store', color: 'primary', link: '/suppliers' }
    ];
}
