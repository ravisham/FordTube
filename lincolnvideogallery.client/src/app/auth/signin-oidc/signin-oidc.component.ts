import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * @description SigninOidcComponent handles the OIDC sign-in process and token exchange.
 */
@Component({
  selector: 'app-signin-oidc',
  template: '<p>Signing in...</p>',
  styleUrls: ['./signin-oidc.component.scss']
})
export class SigninOidcComponent implements OnInit {

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const fragment = this.route.snapshot.fragment;
    let returnUrl = '/';
    this.route.queryParams.subscribe(params => {
      returnUrl = params['returnURL'] || '/';
    });
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      if (accessToken) {
        this.authService.exchangeToken(accessToken)
          .then(() => {
            if (this.authService.isAuthenticated()) {
              if (returnUrl.includes('%%%%%')) {
                const [path, queryString] = returnUrl.replace(/%%%%%%/g, '&').replace(/%%%%%/g, '?').split('?');
                const queryParams = this.parseQueryString(queryString);
                this.router.navigate([path], { queryParams: queryParams });
              } else {
                this.router.navigate([returnUrl]);
              }
            } else {
              console.error('Authentication failed');
              this.router.navigate(['/login']); // Navigate to login on failure
            }
          })
          .catch(error => {
            console.error('Token exchange error', error);
            this.router.navigate(['/login']); // Navigate to login on error
          });
      } else {
        console.error('Access token not found in the URL fragment');
        this.router.navigate(['/login']); // Navigate to login if access token is not found
      }
    } else {
      console.error('URL fragment is null');
      this.router.navigate(['/login']); // Navigate to login if URL fragment is null
    }
  }

  /**
   * Parses the query string into an object.
   * @param queryString The query string to parse.
   * @returns An object representing the query parameters.
   */
  private parseQueryString(queryString: string): any {
    const params = new URLSearchParams(queryString);
    const queryParams: any = {};
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
    return queryParams;
  }
}
