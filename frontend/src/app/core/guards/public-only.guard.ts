import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PublicOnlyGuard implements CanActivate, CanMatch {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): boolean | UrlTree {
        return this.resolveAccess();
    }

    canMatch(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
        return this.resolveAccess();
    }

    private resolveAccess(): boolean | UrlTree {
        return this.authService.getToken()
            ? this.router.createUrlTree(['/dashboard'])
            : true;
    }
}
