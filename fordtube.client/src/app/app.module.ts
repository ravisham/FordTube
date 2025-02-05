import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ClipboardModule } from 'ngx-clipboard';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { NgProgressRouterModule } from '@ngx-progressbar/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/app-admin.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppCommonModule } from './common/app-common.module'; // Ensure this is imported

import { AuthHeaderInterceptor } from './interceptors/auth.header.interceptor';
import { CategoriesService } from './domain/services/categories.service';
import { EventsService } from './domain/services/events.service';
import { FaqService } from './domain/services/faq.service';
import { GroupsService } from './domain/services/groups.service';
import { StarsService } from './domain/services/stars.service';
import { VideoService } from './domain/services/video.service';
import { XapiService } from './domain/services/xapi.service';
import { RestrictionsService } from './domain/services/restrictions.service';
import { DisclaimerService } from './domain/services/disclaimer.service';
import { AuthService } from './auth/auth.service';
import { UserService } from './core/user/user.service';
import { XapiTrackingService } from './core/xapi/services/xapi.tracking.service';

import { EditComponent } from './pages/video/edit/edit.component';
import { EditVideoComponent } from './pages/video/edit-video/edit-video.component';
import { FaqComponent } from './pages/faq/faq.component';
import { FlaggedVideosComponent } from './admin/pages/flagged-videos/flagged-videos.component';
import { HighestRatedComponent } from './pages/video/highest-rated/highest-rated.component';
import { HomeComponent } from './pages/home/home.component';
import { LiveComponent } from './pages/video/live/live.component';
import { ManageComponent } from './pages/video/manage/manage.component';
import { RecentComponent } from './pages/video/recent/recent.component';
import { SearchComponent } from './pages/video/search/search.component';
import { SearchPanelComponent } from './pages/video/search-panel/search-panel.component';
import { StandaloneComponent } from './pages/video/standalone/standalone.component';
import { StandaloneEmbedComponent } from './pages/video/standalone-embed/standalone-embed.component';
import { UploadComponent } from './pages/video/upload/upload.component';
import { VideoComponent } from './pages/video/video/video.component';
import { WatchComponent } from './pages/video/watch/watch.component';
import { AccessDeniedComponent } from './pages/video/access-denied/access-denied.component';
import { EditAccessDeniedComponent } from './pages/video/edit-access-denied/edit-access-denied.component';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { LoaderComponent } from './common/loader/loader.component';
import { InterceptorService } from './interceptors/interceptor.service.service';

export function tokenGetter() {
  return localStorage.getItem("token");
}
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
    EditAccessDeniedComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AngularEditorModule,
    ClipboardModule,
    NgProgressModule,
    NgProgressHttpModule,
    NgProgressRouterModule,
    AppRoutingModule,
    AuthModule,
    AdminModule,
    AppLayoutModule,
    AppCommonModule, // Ensure this is imported
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      }
    }),
  ],
  providers: [
    CategoriesService,
    EventsService,
    FaqService,
    GroupsService,
    StarsService,
    VideoService,
    XapiService,
    RestrictionsService,
    DisclaimerService,
    AuthService,
    UserService,
    XapiTrackingService,
    JwtHelperService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }
