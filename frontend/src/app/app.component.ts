import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { HeaderComponent } from './layout/header/header.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatSidenavModule,
        HeaderComponent,
        SidenavComponent,
        FooterComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'My Garage';
    @ViewChild('drawer') drawer!: MatSidenav;

    private breakpointObserver = inject(BreakpointObserver);
    private authService = inject(AuthService);
    private router = inject(Router);
    private notificationService = inject(NotificationService);

    isAuthenticated$ = this.authService.isAuthenticated$;

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    constructor() {
        // Close sidenav on navigation on mobile
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            if (this.drawer && this.drawer.mode === 'over') {
                this.drawer.close();
            }
        });

        // Check for notifications when authenticated
        this.isAuthenticated$.subscribe(isAuth => {
            if (isAuth) {
                this.notificationService.checkNotifications();
            }
        });
    }
}
