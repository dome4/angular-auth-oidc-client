import { Component, OnInit } from '@angular/core';
import { OidcSecurityService, PublicConfiguration } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-unauthorized',
  templateUrl: 'unauthorized.component.html',
})
export class UnauthorizedComponent implements OnInit {
  configuration: PublicConfiguration;

  constructor(private oidcSecurityService: OidcSecurityService) {}

  ngOnInit() {
    this.configuration = this.oidcSecurityService.configuration;
  }

  login() {
    this.oidcSecurityService.authorize();
  }
}
