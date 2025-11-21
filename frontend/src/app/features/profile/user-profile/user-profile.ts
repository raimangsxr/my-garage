import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService, User } from '../../../core/services/user.service';
import { ImageCropperComponent } from '../../../shared/components/image-cropper/image-cropper';

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
    MatDialogModule,
    ImageCropperComponent
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
  }

  onImageCropped(dataUrl: string) {
    this.form.patchValue({ image_url: dataUrl });
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
