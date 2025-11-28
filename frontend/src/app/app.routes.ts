import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'vehicles', loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
            { path: 'vehicles/:id', loadComponent: () => import('./features/vehicles/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent) },
            { path: 'tracks', loadComponent: () => import('./features/tracks/tracks.component').then(m => m.TracksComponent) },
            { path: 'tracks/:id', loadComponent: () => import('./features/tracks/track-detail.component').then(m => m.TrackDetailComponent) },
            { path: 'maintenance', loadComponent: () => import('./features/maintenance/maintenance.component').then(m => m.MaintenanceComponent) },
            { path: 'invoices/upload', loadComponent: () => import('./features/invoices/invoice-upload/invoice-upload.component').then(m => m.InvoiceUploadComponent) },
            { path: 'invoices/review/:id', loadComponent: () => import('./features/invoices/invoice-review/invoice-review.component').then(m => m.InvoiceReviewComponent) },
            { path: 'invoices/:id', loadComponent: () => import('./features/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent) },
            { path: 'invoices', loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent) },
            { path: 'suppliers', loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
            { path: 'parts', loadComponent: () => import('./features/parts/parts.component').then(m => m.PartsComponent) },
            { path: 'profile', loadComponent: () => import('./features/profile/user-profile/user-profile').then(m => m.UserProfile) },
            { path: 'notifications', loadComponent: () => import('./features/notifications/notifications/notifications').then(m => m.Notifications) },
            { path: 'change-password', loadComponent: () => import('./features/profile/change-password/change-password').then(m => m.ChangePassword) },
            { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
        ]
    },
    { path: '**', redirectTo: '' }
];
