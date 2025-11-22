import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface VehicleInfo {
    brand: string;
    model: string;
    license_plate: string;
    image_url?: string;
}

@Component({
    selector: 'app-vehicle-hero',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './vehicle-hero.component.html',
    styleUrls: ['./vehicle-hero.component.scss']
})
export class VehicleHeroComponent {
    @Input() vehicle!: VehicleInfo;
    @Output() backClick = new EventEmitter<void>();

    onBackClick(): void {
        this.backClick.emit();
    }

    get backgroundImage(): string {
        return this.vehicle.image_url || 'assets/images/default-car.png';
    }
}
