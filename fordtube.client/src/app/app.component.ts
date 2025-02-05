import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { UserService } from './core/user/user.service';
import { ActivationStart, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

/**
 * @description AppComponent is the root component of the application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Ford Tube';
  isEmbed = false;
  showCarousel = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {
    const routerEvents = this.router.events;

    routerEvents.pipe(filter(activationEvent => activationEvent instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });

    routerEvents.pipe(filter(activationEvent => activationEvent instanceof ActivationStart)).subscribe((event: ActivationStart) => {
      if (
        event.hasOwnProperty('snapshot') &&
        event.snapshot.hasOwnProperty('url') &&
        event.snapshot.url.length === 2 &&
        event.snapshot.url[0].hasOwnProperty('path') &&
        event.snapshot.url[0].path === 'standalone' &&
        event.snapshot.url[1].hasOwnProperty('path') &&
        event.snapshot.url[1].path === 'embed'
      ) {
        this.isEmbed = true;
      }
      this.showCarousel =
        event.hasOwnProperty('snapshot') && event.snapshot.hasOwnProperty('data') && event.snapshot.data.hasOwnProperty('showCarousel') ? event.snapshot.data.showCarousel : false;
    });
  }

  ngOnInit(): void {
    // Initialize authentication state
    const token = this.authService.getToken();
    const franchise = environment.franchise === 0 ? 'Ford' : 'Lincoln';
    if (token) {
      this.authService.setAuthenticated(true, token, franchise);
      this.userService.setUserToken(token); // Set the token in the user service
    }
  }
}
