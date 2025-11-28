import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        MatIconModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
    loginForm: FormGroup;
    isLoading = false;
    hide = true;

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    private subscriptions = new Subscription();

    constructor() {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            const { username, password } = this.loginForm.value;

            this.subscriptions.add(
                this.authService.login(username, password).subscribe({
                    next: () => {
                        this.isLoading = false;
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                })
            );
        }
    }
}
