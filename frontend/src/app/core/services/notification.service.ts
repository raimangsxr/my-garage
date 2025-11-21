import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: string; // ITV, INSURANCE, TAX, GENERAL
    is_read: boolean;
    created_at: string;
    user_id: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/notifications/`;

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    constructor() {
        this.loadNotifications();
    }

    loadNotifications(): void {
        this.http.get<Notification[]>(this.apiUrl).subscribe({
            next: (notifications) => {
                this.notificationsSubject.next(notifications);
                this.updateUnreadCount(notifications);
            },
            error: (err) => console.error('Error loading notifications', err)
        });
    }

    checkNotifications(): void {
        this.http.post(this.apiUrl + 'check', {}).subscribe({
            next: () => this.loadNotifications(),
            error: (err) => console.error('Error checking notifications', err)
        });
    }

    markAsRead(id: number): Observable<Notification> {
        return this.http.put<Notification>(`${this.apiUrl}${id}/read`, {}).pipe(
            tap(updated => {
                const current = this.notificationsSubject.value;
                const index = current.findIndex(n => n.id === id);
                if (index !== -1) {
                    current[index] = updated;
                    this.notificationsSubject.next([...current]);
                    this.updateUnreadCount(current);
                }
            })
        );
    }

    markAsUnread(id: number): Observable<Notification> {
        return this.http.put<Notification>(`${this.apiUrl}${id}/unread`, {}).pipe(
            tap(updated => {
                const current = this.notificationsSubject.value;
                const index = current.findIndex(n => n.id === id);
                if (index !== -1) {
                    current[index] = updated;
                    this.notificationsSubject.next([...current]);
                    this.updateUnreadCount(current);
                }
            })
        );
    }

    private updateUnreadCount(notifications: Notification[]): void {
        const count = notifications.filter(n => !n.is_read).length;
        this.unreadCountSubject.next(count);
    }
}
