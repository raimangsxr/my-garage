import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsService } from '../../core/services/settings.service';
import { Settings } from '../../core/models/settings.model';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private settingsService = inject(SettingsService);
    private snackBar = inject(MatSnackBar);

    settingsForm: FormGroup;
    isLoading = false;
    hideGeminiKey = true;

    constructor() {
        this.settingsForm = this.fb.group({
            language: ['en'],
            currency: ['EUR'],
            theme: ['dark'],
            notifications_enabled: [true],
            google_client_id: [''],
            gemini_api_key: ['']
        });
    }

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings(): void {
        this.isLoading = true;
        this.settingsService.getSettings().subscribe({
            next: (settings) => {
                this.settingsForm.patchValue(settings);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading settings:', error);
                this.showSnackBar('Error loading settings');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.settingsForm.valid) {
            this.isLoading = true;
            this.settingsService.updateSettings(this.settingsForm.value).subscribe({
                next: (settings) => {
                    this.showSnackBar('Settings saved successfully');
                    this.isLoading = false;
                    // Here you might want to apply the settings immediately (e.g. change theme)
                },
                error: (error) => {
                    console.error('Error saving settings:', error);
                    this.showSnackBar('Error saving settings');
                    this.isLoading = false;
                }
            });
        }
    }

    private showSnackBar(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
        });
    }
}
