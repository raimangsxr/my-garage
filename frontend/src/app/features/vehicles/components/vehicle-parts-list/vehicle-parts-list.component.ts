import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EntityCardComponent } from '../../../../shared/components/entity-card/entity-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
    selector: 'app-vehicle-parts-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        EntityCardComponent,
        EmptyStateComponent
    ],
    templateUrl: './vehicle-parts-list.component.html',
    styleUrls: ['./vehicle-parts-list.component.scss']
})
export class VehiclePartsListComponent {
    @Input() parts: any[] = [];
    @Output() partClick = new EventEmitter<any>();
    @ViewChild('searchInput') searchInput?: ElementRef;

    isSearchMode = false;
    searchQuery = '';

    get displayParts(): any[] {
        if (!this.searchQuery.trim()) {
            return this.parts;
        }
        const query = this.searchQuery.toLowerCase();
        return this.parts.filter(part =>
            part.name.toLowerCase().includes(query) ||
            part.reference?.toLowerCase().includes(query) ||
            part.supplier?.name?.toLowerCase().includes(query)
        );
    }

    toggleSearchMode() {
        this.isSearchMode = !this.isSearchMode;
        if (this.isSearchMode) {
            setTimeout(() => {
                this.searchInput?.nativeElement.focus();
            });
        } else {
            this.searchQuery = '';
        }
    }

    onPartClick(part: any) {
        this.partClick.emit(part);
    }
}
