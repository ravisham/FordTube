import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddCategoryComponent } from './pages/add-category/add-category.component';
import { AdminArchivesComponent } from './pages/archives/admin.archives.component';
import { AdminCategoriesComponent } from './pages/categories/admin.categories.component';
import { AdminUploadComponent } from './pages/upload/admin.upload.component';
import { PrivateVideosComponent } from './pages/private-videos/private-videos.component';
import { InactiveComponent } from './pages/inactive/inactive.component';
import { VideoCategoryListResolverService } from '../common/resolvers/categories/category-list-resolver/video-category-list-resolver.service';
import { MarketGroupsResolverService } from '../common/resolvers/groups/market-groups-resolver/market-groups-resolver';
import { RoleGroupsResolverService } from '../common/resolvers/groups/role-groups-resolver/role-groups-resolver';
import { FranchiseListResolverService } from '../common/resolvers/categories/franchise-list-resolver/franchise-list-resolver';
import { UserAdminGuard } from '../core/user/guards/user.admin.guard';
import { VideoListResolverService } from '../common/resolvers/videos/list-resolver/video-list-resolver.service';
import { VideoDetailsResolverService } from '../common/resolvers/videos/details-resolver/video-details-resolver.service';
import { VideoCommentsResolverService } from '../common/resolvers/videos/comments-resolver/video-comments-resolver.service';
import { VideoPlaybackUrlResolverService } from '../common/resolvers/videos/playback-url-resolver/video-playback-url-resolver.service';
import { VideoIdResolverService } from '../common/resolvers/videos/id-resolver/video-id-resolver.service';
import { UserDealerAdminGuard } from '../core/user/guards/user.dealer.admin.guard';
import { FlaggedVideosComponent } from './pages/flagged-videos/flagged-videos.component';
import { AdminComponent } from './admin.component';
import { ManageCarouselComponent } from './pages/carousel/manage-carousel.component';
import { QueueComponent } from './pages/queue/queue.component';
import { SecurityGuard } from '../core/user/guards/security.guard';


const routes: Routes = [
  {
    path: 'admin',
    canActivate: [UserAdminGuard],
    component: AdminComponent,
    children: [
      {
        path: 'carousel',
        component: ManageCarouselComponent,
        data: { title: 'Manage Carousel' },
        canActivate: [UserDealerAdminGuard]
      },
      {
        path: 'flagged',
        component: FlaggedVideosComponent,
        data: { title: 'Flagged Videos' },
        canActivate: [UserDealerAdminGuard]
      },

      {
        path: 'private-videos',
        component: PrivateVideosComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Private Videos' }
      },

      {
        path: 'inactive-videos',
        component: InactiveComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Inactive Videos' }
      },

      {
        path: 'archives',
        component: AdminArchivesComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Archives' }
      },

      {
        path: 'categories/:franchise',
        component: AdminCategoriesComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Categories' }
      },

      {
        path: 'categories',
        component: AdminCategoriesComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Categories' }
      },

      {
        path: 'add-category/:franchise',
        component: AddCategoryComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Add Category' }
      },
      {
        path: 'upload',
        component: AdminUploadComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Upload Video' },
        resolve: {
          categories: VideoCategoryListResolverService,
          marketGroups: MarketGroupsResolverService,
          roleGroups: RoleGroupsResolverService,
          franchiseCategories: FranchiseListResolverService
        }
      },
      {
        path: 'queue',
        component: QueueComponent,
        canActivate: [SecurityGuard],
        data: { title: 'Admin Queue' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [
    VideoListResolverService,
    VideoCategoryListResolverService,
    VideoDetailsResolverService,
    VideoCommentsResolverService,
    VideoPlaybackUrlResolverService,
    VideoIdResolverService
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
