import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-page-loader',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './page-loader.component.html',
    styleUrl: './page-loader.component.scss'
})
export class PageLoaderComponent {
    @Input() icon = 'hourglass_top';
    @Input() message = 'Loading...';
    @Input() minHeight = '260px';
    @Input() fullscreen = false;
}
