import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-entity-card',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './entity-card.component.html',
    styleUrls: ['./entity-card.component.scss']
})
export class EntityCardComponent {
    @Input() clickable: boolean = true;
    @Output() cardClick = new EventEmitter<void>();

    onClick(): void {
        if (this.clickable) {
            this.cardClick.emit();
        }
    }
}
