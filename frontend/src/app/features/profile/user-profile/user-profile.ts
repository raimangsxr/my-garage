import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  user: User | null = null;
  avatars: string[] = [];

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
  private readonly CROP_RADIUS = 100;

  constructor() {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      image_url: ['']
    });
  }

  ngOnInit() {
    this.loadUser();
    this.loadAvatars();
  }

  loadUser() {
    this.userService.getMe().subscribe(user => {
      this.user = user;
      this.form.patchValue({
        full_name: user.full_name,
        image_url: user.image_url
      });
    });
  }

  loadAvatars() {
    this.userService.getAvatars().subscribe(avatars => {
      this.avatars = avatars;
    });
  }

  selectAvatar(url: string) {
    this.form.patchValue({ image_url: url });
    this.selectedImageSource = null;
  }

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
    this.ctx.arc(this.CANVAS_SIZE / 2, this.CANVAS_SIZE / 2, this.CROP_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    // Draw Border around circle
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.CANVAS_SIZE / 2, this.CANVAS_SIZE / 2, this.CROP_RADIUS, 0, Math.PI * 2);
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
    const size = 200; // Output size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Calculate source rectangle
    // The circle is at center of canvas (CANVAS_SIZE/2, CANVAS_SIZE/2) with radius CROP_RADIUS
    // We need to map that circle back to the image coordinates

    const circleCenterX = this.CANVAS_SIZE / 2;
    const circleCenterY = this.CANVAS_SIZE / 2;

    // Top-left of the crop area relative to the canvas
    const cropX_Canvas = circleCenterX - this.CROP_RADIUS;
    const cropY_Canvas = circleCenterY - this.CROP_RADIUS;
    const cropDiameter = this.CROP_RADIUS * 2;

    // Map to image coordinates
    // (cropX_Canvas - imgX) / scale
    const sx = (cropX_Canvas - this.imgX) / this.scale;
    const sy = (cropY_Canvas - this.imgY) / this.scale;
    const sSize = cropDiameter / this.scale;

    // Draw clipped image
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(this.image, sx, sy, sSize, sSize, 0, 0, size, size);

    const croppedDataUrl = canvas.toDataURL('image/png');
    this.form.patchValue({ image_url: croppedDataUrl });
    this.isCropping = false;
    this.selectedImageSource = null;
  }

  cancelCrop() {
    this.isCropping = false;
    this.selectedImageSource = null;
  }

  onSubmit() {
    if (this.form.valid) {
      this.userService.updateMe(this.form.value).subscribe({
        next: (user) => {
          this.user = user;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
