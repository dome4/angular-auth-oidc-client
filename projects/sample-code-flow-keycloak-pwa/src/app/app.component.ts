import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { defer, of } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private oidcSecurityService: OidcSecurityService, private router: Router) {}

  ngOnInit() {
    this.oidcSecurityService
      .checkAuth()
      .pipe(
        take(1),
        switchMap((isAuthenticated: boolean) => {
          // if user not authenticated - try session refresh if a refresh token exists
          if (!isAuthenticated) {
            // does refresh token exist?
            const refreshToken = this.oidcSecurityService.getRefreshToken();

            if (!!refreshToken?.trim()) {
              // if refresh token exists -> try session refresh
              console.log('starting forceRefreshSession');

              return this.oidcSecurityService.forceRefreshSession().pipe(
                tap((result) => {
                  console.log('forceRefreshSession: ', result);
                })
              );
            }
            // refresh token does not exist
            return of(false);
          }

          // user is authenticated
          return of(true);
        }),
        switchMap((result) => {
          // @ts-ignore
          if (!!result?.idToken?.trim()) {
            // rerun checkAuth if forceRefreshSession was successful to restart silent renew
            console.log('rerun checkAuth');
            return this.oidcSecurityService.checkAuth().pipe(take(1));
          }
          // map false and null to false, otherwise return true
          return of(!!result);
        }),
        switchMap((isAuthenticated: boolean) => {
          // redirect user according to auth state
          let redirectUrl = ['/unauthorized'];
          if (isAuthenticated) {
            redirectUrl = ['/home'];
          }
          return defer(async () => await this.router.navigate(redirectUrl));
        }),
        catchError((err) => {
          console.log('error: ', err);
          return defer(async () => await this.router.navigate(['/unauthorized']));
        })
      )
      .subscribe(() => console.log('auth init done'));

    // TODO: wrap isAuthenticated$
    this.oidcSecurityService.isAuthenticated$.subscribe((isAuthenticated) => {
      console.log('isAuthenticated$: ', isAuthenticated);
    });
  }
}
