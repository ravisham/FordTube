import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replace BrowserModule with CommonModule
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { NgProgressRouterModule } from '@ngx-progressbar/router';

import { AppAdminRoutingModule } from './app-admin-routing.module';
import { AdminComponent } from './admin.component';
import { AddCategoryComponent } from './pages/add-category/add-category.component';
import { AdminArchivesComponent } from './pages/archives/admin.archives.component';
import { AdminCategoriesComponent } from './pages/categories/admin.categories.component';
import { AdminNavComponent } from './layout/admin-nav/admin-nav.component';
import { AdminUploadComponent } from './pages/upload/admin.upload.component';
import { ManageCarouselComponent } from './pages/carousel/manage-carousel.component';
import { AdminReportingComponent } from './pages/admin-reporting/admin-reporting.component';
import { InactiveComponent } from './pages/inactive/inactive.component';
import { PrivateVideosComponent } from './pages/private-videos/private-videos.component';
import { QueueComponent } from './pages/queue/queue.component';
import { TotalVideosComponent } from './layout/total-videos/total-videos.component';

import { AuthHeaderInterceptor } from '../interceptors/auth.header.interceptor';
import { FaqService } from '../domain/services/faq.service';
import { EventsService } from '../domain/services/events.service';
import { StarsService } from '../domain/services/stars.service';
import { XapiService } from '../domain/services/xapi.service';
import { RestrictionsService } from '../domain/services/restrictions.service';
import { VideoService } from '../domain/services/video.service';
import { FeaturedService } from '../domain/services/featured.service';
import { UsersService } from '../domain/services/users.service';
import { GroupsService } from '../domain/services/groups.service';
import { CategoriesService } from '../domain/services/categories.service';
import { AppLayoutModule } from '../layout/app.layout.module';
import { AppCommonModule } from '../common/app-common.module';

@NgModule({
  declarations: [
    AdminComponent,
    AddCategoryComponent,
    AdminArchivesComponent,
    ManageCarouselComponent,
    AdminReportingComponent,
    AdminCategoriesComponent,
    AdminNavComponent,
    AdminUploadComponent,
    InactiveComponent,
    PrivateVideosComponent,
    QueueComponent,
    TotalVideosComponent,
    AdminReportingComponent
  ],
  imports: [
    CommonModule, // Use CommonModule here
    NgbModule,
    AppAdminRoutingModule,
    HttpClientModule,
    NgProgressModule,
    NgProgressHttpModule,
    NgProgressRouterModule,
    AppLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorModule,
    AppCommonModule
  ],
  providers: [
    FaqService,
    EventsService,
    StarsService,
    XapiService,
    RestrictionsService,
    VideoService,
    FeaturedService,
    UsersService,
    GroupsService,
    CategoriesService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true
    }
  ]
})
export class AdminModule { }
