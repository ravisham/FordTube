import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FaqComponent } from './pages/faq/faq.component';
import { EditComponent } from './pages/video/edit/edit.component';
import { LiveComponent } from './pages/video/live/live.component';
import { ManageComponent } from './pages/video/manage/manage.component';
import { WatchComponent } from './pages/video/watch/watch.component';
import { SearchComponent } from './pages/video/search/search.component';
import { UploadComponent } from './pages/video/upload/upload.component';
import { VideoCategoryListResolverService } from './common/resolvers/categories/category-list-resolver/video-category-list-resolver.service';
import { VideoListResolverService } from './common/resolvers/videos/list-resolver/video-list-resolver.service';
import { VideoCommentsResolverService } from './common/resolvers/videos/comments-resolver/video-comments-resolver.service';
import { VideoPlaybackUrlResolverService } from './common/resolvers/videos/playback-url-resolver/video-playback-url-resolver.service';
import { VideoDetailsResolverService } from './common/resolvers/videos/details-resolver/video-details-resolver.service';
import { VideoIdResolverService } from './common/resolvers/videos/id-resolver/video-id-resolver.service';
import { EditVideoComponent } from './pages/video/edit-video/edit-video.component';
import { FranchiseListResolverService } from './common/resolvers/categories/franchise-list-resolver/franchise-list-resolver';
import { EventsListResolverService } from './common/resolvers/events/events-list-resolver/events-list-resolver.service';
import { StandaloneComponent } from './pages/video/standalone/standalone.component';
import { StandaloneEmbedComponent } from './pages/video/standalone-embed/standalone-embed.component';
import { VideoComponent } from './pages/video/video/video.component';
import { VideoDetailsForEditResolverService } from './common/resolvers/videos/details-for-edit-resolver/details-for-edit-resolver.service';
import { UserEmployeeDealerAdminGuard } from './core/user/guards/user.employee.dealer.admin.guard';
import { MarketGroupsResolverService } from './common/resolvers/groups/market-groups-resolver/market-groups-resolver';
import { RoleGroupsResolverService } from './common/resolvers/groups/role-groups-resolver/role-groups-resolver';
import { AccessDeniedComponent } from './pages/video/access-denied/access-denied.component';
import { HomeComponent } from './pages/home/home.component';
import { SecurityGuard } from './core/user/guards/security.guard';
import { EditAccessDeniedComponent } from './pages/video/edit-access-denied/edit-access-denied.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [SecurityGuard],
    resolve: {
      categories: VideoCategoryListResolverService,
    },
    data: { showCarousel: true, isHomePage: true },
  },
  {
    path: 'standalone',
    component: StandaloneComponent,
    resolve: {
      videoDetailsResponse: VideoDetailsResolverService,
    },
  },
  {
    path: 'standalone/embed',
    component: StandaloneEmbedComponent,
    resolve: {
      videoDetailsResponse: VideoDetailsResolverService,
    },
  },
  {
    path: 'watch',
    component: WatchComponent,
    canActivate: [SecurityGuard],
    resolve: {
      videoDetailsResponse: VideoDetailsResolverService,
      videoCommentsResponse: VideoCommentsResolverService,
      videoPlaybackUrlResponse: VideoPlaybackUrlResolverService,
    },
  },

  {
    path: 'manage',
    component: ManageComponent,
    canActivate: [ UserEmployeeDealerAdminGuard],
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: 'edit-access-denied',
    component: EditAccessDeniedComponent
  },
  {
    path: 'edit-video',
    component: EditVideoComponent,
    canActivate: [SecurityGuard],
    resolve: {
      categories: VideoCategoryListResolverService,
      videoDetailsResponse: VideoDetailsForEditResolverService,
      marketGroups: MarketGroupsResolverService,
      roleGroups: RoleGroupsResolverService,
      franchiseCategories: FranchiseListResolverService,
    },
  },
  {
    path: 'highest-rated',
    component: SearchComponent,
    canActivate: [SecurityGuard],
    data: { isHighestRatedPage: true },
    resolve: {
      categories: VideoCategoryListResolverService,
    },
  },
  {
    path: 'category',
    component: SearchComponent,
    canActivate: [SecurityGuard],
    resolve: {
      categories: VideoCategoryListResolverService,
    },
  },
  {
    path: 'video.php',
    component: VideoComponent,
    canActivate: [SecurityGuard],
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [SecurityGuard]
  },
  {
    path: 'upload',
    component: UploadComponent,
    canActivate: [UserEmployeeDealerAdminGuard],
    resolve: {
      categories: VideoCategoryListResolverService,
      marketGroups: MarketGroupsResolverService,
      roleGroups: RoleGroupsResolverService,
      franchiseCategories: FranchiseListResolverService,
    },
  },
  {
    path: 'recent',
    redirectTo: 'search?s=when',
    pathMatch: 'full'
  },
  {
    path: 'highest-rated',
    redirectTo: 'search?s=score',
    pathMatch: 'full'
  },
  {
    path: 'live',
    component: LiveComponent,
    canActivate: [SecurityGuard],
    resolve: {
      events: EventsListResolverService,
    },
  },
  {
    path: 'faq',
    component: FaqComponent,
    canActivate: [SecurityGuard]
  },
  {
    path: 'edit',
    component: EditComponent,
    canActivate: [SecurityGuard]
  },

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [
    VideoListResolverService,
    VideoCategoryListResolverService,
    VideoDetailsResolverService,
    VideoCommentsResolverService,
    VideoPlaybackUrlResolverService,
    VideoIdResolverService,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
