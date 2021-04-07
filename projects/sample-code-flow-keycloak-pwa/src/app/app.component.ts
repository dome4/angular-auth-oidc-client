import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { defer, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(
      (isAuthenticated) => console.log('app authenticated', isAuthenticated),
      (err) => console.error('checkAuth: ', err),
      () => console.error('checkAuth completed')
    );

    this.debug();
  }

  debug() {
    timer(1000, 3000).pipe(
      switchMap(() =>
        defer(async () => {
          const isAuthenticated = await this.oidcSecurityService.isAuthenticated$.pipe(take(1)).toPromise();
          console.log('test isAuthenticated: ', isAuthenticated);
        })
      )
    );
  }
}
