import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
    selector: 'app-google-sign-in',
    standalone: true,
    templateUrl: './google-sign-in.component.html',
    styleUrls: ['./google-sign-in.component.scss']
})
export class GoogleSignInComponent implements OnInit, AfterViewInit {

    constructor(private googleAuthService: GoogleAuthService) { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.googleAuthService.initializeGoogleSignIn('google-btn');
    }

}
