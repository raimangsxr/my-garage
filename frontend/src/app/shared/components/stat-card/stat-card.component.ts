import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './stat-card.component.html',
    styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
    @Input() icon!: string;
    @Input() label!: string;
    @Input() value!: string | number;
    @Input() warning: boolean = false;
    @Input() danger: boolean = false;
}
