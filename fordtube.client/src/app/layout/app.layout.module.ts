import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replace BrowserModule with CommonModule
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppCommonModule } from '../common/app-common.module';

import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { HeaderSearchComponent } from './header-search/header-search.component';
import { CarouselComponent } from './carousel/carousel.component';

import { SideNavCloseDirective } from './side-nav/directives/side-nav-close.directive';
import { HeaderSearchCloseDirective } from './header-search/directives/header-search-close.directive';

import { SideNavService } from './side-nav/services/side-nav.service';
import { HeaderSearchService } from './header-search/services/header-search.service';
import { CarouselService } from '../domain/services/carousel.service';
import { CarouselSingletonService } from './carousel/services/carousel-singleton.service';
import { SafeHtmlPipe } from '../common/pipes/safe-html/safe-html.pipe';

@NgModule({
  imports: [
    CommonModule, // Use CommonModule here
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AppCommonModule // Ensure this is imported
  ],
  declarations: [
    FooterComponent,
    HeaderComponent,
    SideNavComponent,
    HeaderSearchComponent,
    CarouselComponent,
    SideNavCloseDirective,
    HeaderSearchCloseDirective
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    SideNavComponent,
    HeaderSearchComponent,
    CarouselComponent,
    SideNavCloseDirective,
    HeaderSearchCloseDirective
  ],
  providers: [
    SideNavService,
    HeaderSearchService,
    CarouselService,
    CarouselSingletonService,
    SafeHtmlPipe
  ]
})
export class AppLayoutModule { }
