import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AppCommonModule } from './common/app-common.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthHeaderInterceptor } from './interceptors/auth.header.interceptor';
import { AuthenticationService } from './domain/services/authentication.service';
import { CategoriesService } from './domain/services/categories.service';
import { ClipboardModule } from 'ngx-clipboard';
import { EditComponent } from './pages/video/edit/edit.component';
import { EditVideoComponent } from './pages/video/edit-video/edit-video.component';
import { EventsService } from './domain/services/events.service';
import { FaqComponent } from './pages/faq/faq.component';
import { FaqService } from './domain/services/faq.service';
import { FlaggedVideosComponent } from './admin/pages/flagged-videos/flagged-videos.component';
import { GroupsService } from './domain/services/groups.service';
import { HighestRatedComponent } from './pages/video/highest-rated/highest-rated.component';
import { HomeComponent } from './pages/home/home.component';
import { LiveComponent } from './pages/video/live/live.component';
import { ManageComponent } from './pages/video/manage/manage.component';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { RecentComponent } from './pages/video/recent/recent.component';
import { SearchComponent } from './pages/video/search/search.component';
import { SearchPanelComponent } from './pages/video/search-panel/search-panel.component';
import { StandaloneComponent } from './pages/video/standalone/standalone.component';
import { StandaloneEmbedComponent } from './pages/video/standalone-embed/standalone-embed.component';
import { StarsService } from './domain/services/stars.service';
import { UploadComponent } from './pages/video/upload/upload.component';
import { UserAdminGuard } from './core/user/guards/user.admin.guard';
import { UserDealerAdminGuard } from './core/user/guards/user.dealer.admin.guard';
import { UserDealerGuard } from './core/user/guards/user.dealer.guard';
import { UserEmployeeDealerAdminGuard } from './core/user/guards/user.employee.dealer.admin.guard';
import { UserProfileService } from './core/user/services/user.profile.service';
import { UsersService } from './domain/services/users.service';
import { VideoComponent } from './pages/video/video/video.component';
import { VideoService } from './domain/services/video.service';
import { XapiService } from './domain/services/xapi.service';
import { WatchComponent } from './pages/video/watch/watch.component';
import { AdminModule } from './admin/app-admin.module';
import { RestrictionsService } from './domain/services/restrictions.service';
import { AccessDeniedComponent } from './pages/video/access-denied/access-denied.component';
import { XapiTrackingService } from './core/xapi/services/xapi.tracking.service';
import { DisclaimerService } from './domain/services/disclaimer.service';
import { SafeEmbedPipe } from './common/pipes/safe-embed/safe-embed.pipe';
import { SecurityGuard } from './core/user/guards/security.guard';
import { EditAccessDeniedComponent } from './pages/video/edit-access-denied/edit-access-denied.component';
import { CookieValueService } from './domain/services/cookievalue.service';

@NgModule({
  declarations: [
    AppComponent,
    EditComponent,
    EditVideoComponent,
    FaqComponent,
    FlaggedVideosComponent,
    HighestRatedComponent,
    HomeComponent,
    LiveComponent,
    ManageComponent,
    RecentComponent,
    SearchComponent,
    SearchPanelComponent,
    StandaloneComponent,
    StandaloneEmbedComponent,
    UploadComponent,
    VideoComponent,
    WatchComponent,
    AccessDeniedComponent,
    EditAccessDeniedComponent
  ],
  imports: [
    AdminModule,
    NgbModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ClipboardModule,
    AngularEditorModule,
    NgProgressModule,
    NgProgressHttpModule,
    NgProgressRouterModule,
    AppCommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppLayoutModule
  ],
  providers: [
    FaqService,
    EventsService,
    DisclaimerService,
    StarsService,
    RestrictionsService,
    AuthenticationService,
    VideoService,
    UsersService,
    SafeEmbedPipe,
    GroupsService,
    XapiService,
    XapiTrackingService,
    UserAdminGuard,
    UserDealerAdminGuard,
    UserEmployeeDealerAdminGuard,
    UserDealerGuard,
    CategoriesService,
    UserProfileService,
    SecurityGuard,
    CookieValueService,
    {
      provide: APP_INITIALIZER,
      useFactory: (userProfileService: UserProfileService) => () => userProfileService.fetchUserProfile().toPromise(),
      deps: [UserProfileService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
