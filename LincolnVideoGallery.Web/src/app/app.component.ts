import { Component, OnInit } from '@angular/core';
import { Router, ActivationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserProfileService } from './core/user/services/user.profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isEmbed = false;
  showCarousel = false;

  constructor(
    private router: Router,
    private userProfileService: UserProfileService
  ) {
    const routerEvents = this.router.events;

    routerEvents
      .pipe((filter(activationEvent => activationEvent instanceof NavigationEnd)) as any)
      .subscribe((event: NavigationEnd) => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });

    routerEvents
      .pipe(
        (filter(activationEvent => activationEvent instanceof ActivationStart)) as any
      )
      .subscribe((event: ActivationStart) => {
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
          event.hasOwnProperty('snapshot') &&
          event.snapshot.hasOwnProperty('data') &&
          event.snapshot.data.hasOwnProperty('showCarousel')
          ? event.snapshot.data.showCarousel
          : false;
      });
  }

  ngOnInit() {
    if (!this.userProfileService.getCurrentUserProfile()) {
      this.userProfileService.fetchUserProfile().subscribe(profile => {
        if (profile) {
          this.userProfileService.setUserProfile(profile);
        }
      });
    }
  }
}
