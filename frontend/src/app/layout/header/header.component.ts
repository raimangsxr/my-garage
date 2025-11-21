import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    @Output() menuToggle = new EventEmitter<void>();

    // Mock user data
    user = {
        name: 'Ricardo Romaní',
        imageUrl: 'https://material.angular.io/assets/img/examples/shiba1.jpg'
    };

    constructor(private authService: AuthService) { }

    toggleMenu() {
        this.menuToggle.emit();
    }

    logout() {
        this.authService.logout();
    }
}
