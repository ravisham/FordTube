import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SideNavService } from './side-nav/services/side-nav.service';
import { SideNavComponent } from './side-nav/side-nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderSearchComponent } from './header-search/header-search.component';
import { HeaderSearchService } from './header-search/services/header-search.service';
import { SideNavCloseDirective } from './side-nav/directives/side-nav-close.directive';
import { CarouselComponent } from './carousel/carousel.component';
import { CarouselService } from '../domain/services/carousel.service';
import { AppCommonModule } from '../common/app-common.module';
import { SafeHtmlPipe } from '../common/pipes/safe-html/safe-html.pipe';
import { CarouselSingletonService } from './carousel/services/carousel-singleton.service';
import { HeaderSearchCloseDirective } from './header-search/directives/header-search-close.directive';
import { UserProfileService } from '../core/user/services/user.profile.service';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule
  ],
  declarations: [
    CarouselComponent,
    FooterComponent,
    HeaderComponent,
    SideNavComponent,
    HeaderSearchComponent,
    SideNavCloseDirective,
    HeaderSearchCloseDirective
  ],
  exports: [
    CarouselComponent,
    FooterComponent,
    HeaderComponent,
    SideNavComponent,
    HeaderSearchComponent,
    SideNavCloseDirective,
    HeaderSearchCloseDirective
  ],
  providers: [
    CarouselService,
    CarouselSingletonService,
    SafeHtmlPipe,
    SideNavService,
    HeaderSearchService,
    UserProfileService
  ]
})
export class AppLayoutModule { }
