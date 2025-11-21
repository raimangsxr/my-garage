import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sidenav',
    standalone: true,
    imports: [CommonModule, MatListModule, MatIconModule, RouterModule],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
    modules = [
        { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { name: 'Vehicles', icon: 'directions_car', route: '/vehicles' },
        { name: 'Maintenance', icon: 'build', route: '/maintenance' },
        { name: 'Invoices', icon: 'receipt', route: '/invoices' },
        { name: 'Suppliers', icon: 'store', route: '/suppliers' },
    ];
}
