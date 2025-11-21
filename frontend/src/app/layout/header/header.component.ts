import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterModule, MatBadgeModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    @Output() menuToggle = new EventEmitter<void>();

    private authService = inject(AuthService);
    private userService = inject(UserService);
    private notificationService = inject(NotificationService);

    user: User | null = null;
    unreadCount = 0;

    ngOnInit() {
        this.userService.currentUser$.subscribe(user => {
            this.user = user;
        });

        this.notificationService.unreadCount$.subscribe(count => {
            this.unreadCount = count;
        });

        // Initial fetch
        this.userService.getMe().subscribe();
        this.notificationService.loadNotifications();
    }

    toggleMenu() {
        this.menuToggle.emit();
    }

    logout() {
        this.authService.logout();
    }
}
