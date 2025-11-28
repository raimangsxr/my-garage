import { Component, EventEmitter, Output, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService, User } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterModule, MatBadgeModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    @Output() menuToggle = new EventEmitter<void>();

    private authService = inject(AuthService);
    private userService = inject(UserService);
    private notificationService = inject(NotificationService);

    user: User | null = null;
    unreadCount = 0;

    private subscriptions = new Subscription();

    ngOnInit() {
        this.subscriptions.add(
            this.userService.currentUser$.subscribe(user => {
                this.user = user;
            })
        );

        this.subscriptions.add(
            this.notificationService.unreadCount$.subscribe(count => {
                this.unreadCount = count;
            })
        );

        // Initial fetch
        this.subscriptions.add(this.userService.getMe().subscribe());
        this.notificationService.loadNotifications();
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    toggleMenu() {
        this.menuToggle.emit();
    }

    logout() {
        this.authService.logout();
    }
}
