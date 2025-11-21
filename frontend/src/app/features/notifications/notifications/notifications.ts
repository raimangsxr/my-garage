import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Notification, NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    this.notificationService.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        error: () => this.showSnackBar('Error marking as read')
      });
    }
  }

  markAsUnread(event: Event, notification: Notification): void {
    event.stopPropagation();
    if (notification.is_read) {
      this.notificationService.markAsUnread(notification.id).subscribe({
        error: () => this.showSnackBar('Error marking as unread')
      });
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'ITV': return 'build';
      case 'INSURANCE': return 'security';
      case 'TAX': return 'euro';
      default: return 'notifications';
    }
  }

  getClass(type: string): string {
    switch (type) {
      case 'ITV': return 'type-itv';
      case 'INSURANCE': return 'type-insurance';
      case 'TAX': return 'type-tax';
      default: return 'type-general';
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000
    });
  }
}
