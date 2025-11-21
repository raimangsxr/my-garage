import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './image-cropper.html',
  styleUrl: './image-cropper.scss'
})
export class ImageCropperComponent {
  @Input() outputSize = 200;
  @Input() cropRadius = 100;
  @Output() imageCropped = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  // Image Cropping State
  selectedImageSource: string | null = null;
  isCropping = false;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private image = new Image();

  // Crop state
  private scale = 1;
  private imgX = 0;
  private imgY = 0;
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  // Constants
  private readonly CANVAS_SIZE = 400;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.startCropping(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onUrlInput(url: string) {
    if (url) {
      this.startCropping(url);
    }
  }

  startCropping(imageSrc: string) {
    this.isCropping = true;
    this.selectedImageSource = imageSrc;
    this.image.src = imageSrc;
    this.image.onload = () => {
      // Calculate initial scale to fit image within canvas
      const scaleX = this.CANVAS_SIZE / this.image.width;
      const scaleY = this.CANVAS_SIZE / this.image.height;
      this.scale = Math.max(scaleX, scaleY); // Cover mode

      // Center image
      this.imgX = (this.CANVAS_SIZE - this.image.width * this.scale) / 2;
      this.imgY = (this.CANVAS_SIZE - this.image.height * this.scale) / 2;

      // Wait for view update then draw
      setTimeout(() => this.drawCropper(), 0);
    };
  }

  drawCropper() {
    if (!this.canvas) return;
    const canvas = this.canvas.nativeElement;
    canvas.width = this.CANVAS_SIZE;
    canvas.height = this.CANVAS_SIZE;
    this.ctx = canvas.getContext('2d')!;

    // Clear
    this.ctx.clearRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);

    // Draw Image
    this.ctx.drawImage(
      this.image,
      this.imgX,
      this.imgY,
      this.image.width * this.scale,
      this.image.height * this.scale
    );

    // Draw Overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);

    // Draw Cutout Circle
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(this.CANVAS_SIZE / 2, this.CANVAS_SIZE / 2, this.cropRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    // Draw Border around circle
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.CANVAS_SIZE / 2, this.CANVAS_SIZE / 2, this.cropRadius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;

    this.imgX += deltaX;
    this.imgY += deltaY;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.drawCropper();
  }

  onMouseUp() {
    this.isDragging = false;
  }

  confirmCrop() {
    const canvas = document.createElement('canvas');
    canvas.width = this.outputSize;
    canvas.height = this.outputSize;
    const ctx = canvas.getContext('2d')!;

    // Calculate source rectangle
    const circleCenterX = this.CANVAS_SIZE / 2;
    const circleCenterY = this.CANVAS_SIZE / 2;

    // Top-left of the crop area relative to the canvas
    const cropX_Canvas = circleCenterX - this.cropRadius;
    const cropY_Canvas = circleCenterY - this.cropRadius;
    const cropDiameter = this.cropRadius * 2;

    // Map to image coordinates
    const sx = (cropX_Canvas - this.imgX) / this.scale;
    const sy = (cropY_Canvas - this.imgY) / this.scale;
    const sSize = cropDiameter / this.scale;

    // Draw clipped image
    ctx.beginPath();
    ctx.arc(this.outputSize / 2, this.outputSize / 2, this.outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(this.image, sx, sy, sSize, sSize, 0, 0, this.outputSize, this.outputSize);

    const croppedDataUrl = canvas.toDataURL('image/png');
    this.imageCropped.emit(croppedDataUrl);
    this.reset();
  }

  cancelCrop() {
    this.reset();
    this.cancelled.emit();
  }

  reset() {
    this.isCropping = false;
    this.selectedImageSource = null;
  }
}
