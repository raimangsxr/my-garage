import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-entity-column',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './entity-column.component.html',
    styleUrls: ['./entity-column.component.scss']
})
export class EntityColumnComponent {
    @Input() title!: string;
    @Input() icon!: string;
    @Input() count: number = 0;
}
