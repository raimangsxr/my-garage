import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, of, tap } from 'rxjs';
import { LoggerService } from './logger.service';
import { buildApiUrl } from '../utils/api-url.util';
import { PaginatedResponse, normalizePaginated } from '../models/paginated.model';
import { AuthService } from './auth.service';

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
    private apiUrl = buildApiUrl('notifications');
    private logger = inject(LoggerService);
    private authService = inject(AuthService);

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    getNotificationsPage(skip = 0, limit = 100): Observable<PaginatedResponse<Notification>> {
        if (!this.authService.getToken()) {
            return of({ items: [], total: 0, skip, limit });
        }

        const params = new HttpParams()
            .set('skip', skip)
            .set('limit', limit);

        return this.http.get<Notification[] | PaginatedResponse<Notification>>(this.apiUrl, { params }).pipe(
            map(response => normalizePaginated(response, skip, limit))
        );
    }

    getNotifications(skip = 0, limit = 100): Observable<Notification[]> {
        return this.getNotificationsPage(skip, limit).pipe(
            tap(notifications => {
                const items = notifications.items;
                this.notificationsSubject.next(items);
                this.updateUnreadCount(items);
            }),
            map(page => page.items)
        );
    }

    loadNotifications(skip = 0, limit = 100): void {
        if (!this.authService.getToken()) {
            this.notificationsSubject.next([]);
            this.unreadCountSubject.next(0);
            return;
        }

        this.getNotificationsPage(skip, limit).subscribe({
            next: (notifications) => {
                const items = notifications.items;
                this.notificationsSubject.next(items);
                this.updateUnreadCount(items);
            },
            error: (err) => this.logger.error('Error loading notifications', err)
        });
    }

    checkNotifications(): void {
        if (!this.authService.getToken()) {
            this.notificationsSubject.next([]);
            this.unreadCountSubject.next(0);
            return;
        }

        this.http.post(`${this.apiUrl}/check`, {}).subscribe({
            next: () => this.loadNotifications(),
            error: (err) => this.logger.error('Error checking notifications', err)
        });
    }

    markAsRead(id: number): Observable<Notification> {
        return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
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
        return this.http.put<Notification>(`${this.apiUrl}/${id}/unread`, {}).pipe(
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
