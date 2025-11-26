import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-image-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="image-dialog-container">
      <div class="actions">
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <img [src]="data.imageUrl" alt="Preview">
    </div>
  `,
    styles: [`
    .image-dialog-container {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
    }
    .actions {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }
    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }
    button {
      background: rgba(0,0,0,0.5);
      color: white;
    }
  `]
})
export class ImageDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }) { }
}
