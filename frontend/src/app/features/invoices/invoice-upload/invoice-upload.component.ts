import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { GoogleSignInComponent } from '../../../shared/components/google-sign-in/google-sign-in.component';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

@Component({
    selector: 'app-invoice-upload',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatCardModule,
        MatSnackBarModule,
        MatSnackBarModule,
        GoogleSignInComponent,
        SafeUrlPipe
    ],
    templateUrl: './invoice-upload.component.html',
    styleUrls: ['./invoice-upload.component.scss']
})
export class InvoiceUploadComponent implements OnInit {
    isDragging = false;
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    uploading = false;
    isAuthenticated = false;

    constructor(
        private googleAuthService: GoogleAuthService,
        private invoiceService: InvoiceService,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.googleAuthService.user$.subscribe(user => {
            this.isAuthenticated = !!user;
        });
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    onFileSelected(event: any) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFile(file: File) {
        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            this.snackBar.open('Invalid file type. Please upload PDF or Image.', 'Close', { duration: 3000 });
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.snackBar.open('File too large. Maximum size is 10MB.', 'Close', { duration: 3000 });
            return;
        }

        this.selectedFile = file;

        // Create preview
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            this.previewUrl = null;
        }
    }

    uploadInvoice() {
        if (!this.selectedFile || !this.isAuthenticated) return;

        this.uploading = true;
        this.invoiceService.uploadInvoice(this.selectedFile).subscribe({
            next: (invoice) => {
                this.uploading = false;
                this.snackBar.open('Invoice uploaded successfully! Processing...', 'Close', { duration: 3000 });
                // Navigate to the list or detail to see progress
                this.router.navigate(['/invoices']);
            },
            error: (err) => {
                this.uploading = false;
                console.error('Upload failed', err);
                this.snackBar.open('Upload failed. Please try again.', 'Close', { duration: 3000 });
            }
        });
    }

    clearFile() {
        this.selectedFile = null;
        this.previewUrl = null;
    }
}
