import { AddCategoryComponent } from './pages/add-category/add-category.component';
import { AdminArchivesComponent } from './pages/archives/admin.archives.component';
import { AdminCategoriesComponent } from './pages/categories/admin.categories.component';
import { AdminComponent } from './admin.component';
import { AdminNavComponent } from './layout/admin-nav/admin-nav.component';
import { AdminRoutingModule } from './app-admin-routing.module';
import { AdminUploadComponent } from './pages/upload/admin.upload.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AppCommonModule } from '../common/app-common.module';
import { AppLayoutModule } from '../layout/app.layout.module';
import { AuthHeaderInterceptor } from '../interceptors/auth.header.interceptor';
import { AuthenticationService } from '../domain/services/authentication.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CarouselService } from '../domain/services/carousel.service';
import { CategoriesService } from '../domain/services/categories.service';
import { EventsService } from '../domain/services/events.service';
import { FaqService } from '../domain/services/faq.service';
import { FeaturedService } from '../domain/services/featured.service';
import { GroupsService } from '../domain/services/groups.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InactiveComponent } from './pages/inactive/inactive.component';
import { ManageCarouselComponent } from './pages/carousel/manage-carousel.component';
import { NgModule } from '@angular/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PrivateVideosComponent } from './pages/private-videos/private-videos.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StarsService } from '../domain/services/stars.service';
import { RestrictionsService } from '../domain/services/restrictions.service';
import { UserAdminGuard } from '../core/user/guards/user.admin.guard';
import { UserDealerAdminGuard } from '../core/user/guards/user.dealer.admin.guard';
import { UserDealerGuard } from '../core/user/guards/user.dealer.guard';
import { UserEmployeeDealerAdminGuard } from '../core/user/guards/user.employee.dealer.admin.guard';
import { UserProfileService } from '../core/user/services/user.profile.service';
import { UsersService } from '../domain/services/users.service';
import { VideoService } from '../domain/services/video.service';
import { XapiService } from '../domain/services/xapi.service';
import { QueueComponent } from './pages/queue/queue.component';
import { TotalVideosComponent } from './layout/total-videos/total-videos.component';

@NgModule({
  declarations: [
    AdminComponent,
    AddCategoryComponent,
    AdminArchivesComponent,
    ManageCarouselComponent,
    AdminCategoriesComponent,
    AdminNavComponent,
    AdminUploadComponent,
    InactiveComponent,
    PrivateVideosComponent,
    QueueComponent,
    TotalVideosComponent
  ],
  imports: [
    NgbModule,
    AdminRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgProgressModule,
    NgProgressHttpModule,
    NgProgressRouterModule,
    AppLayoutModule,
    AppCommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorModule
  ],
  providers: [
    CarouselService,
    FaqService,
    EventsService,
    StarsService,
    XapiService,
    RestrictionsService,
    AuthenticationService,
    VideoService,
    FeaturedService,
    UsersService,
    GroupsService,
    UserAdminGuard,
    UserDealerAdminGuard,
    UserEmployeeDealerAdminGuard,
    UserDealerGuard,
    CategoriesService,
    UserProfileService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true
    }
  ]
})
export class AdminModule { }
