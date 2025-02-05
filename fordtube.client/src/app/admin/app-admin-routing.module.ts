import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
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
import { UserAdminGuard } from '../auth/guards/user.admin.guard';
import { FlaggedVideosComponent } from './pages/flagged-videos/flagged-videos.component';
import { ManageCarouselComponent } from './pages/carousel/manage-carousel.component';
import { QueueComponent } from './pages/queue/queue.component';
import { AdminReportingComponent } from './pages/admin-reporting/admin-reporting.component';

const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [UserAdminGuard],
    component: AdminComponent,
    children: [
      {
        path: 'carousel',
        component: ManageCarouselComponent,
        data: { title: 'Manage Carousel' },
        canActivate: [UserAdminGuard]
      },
      {
        path: 'flagged',
        component: FlaggedVideosComponent,
        data: { title: 'Flagged Videos' },
        canActivate: [UserAdminGuard]
      },
      {
        path: 'private-videos',
        component: PrivateVideosComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Private Videos' }
      },
      {
        path: 'admin-reporting',
        component: AdminReportingComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Admin Reporting' }
      },
      {
        path: 'inactive-videos',
        component: InactiveComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Inactive Videos' }
      },
      {
        path: 'archives',
        component: AdminArchivesComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Archives' }
      },
      {
        path: 'categories/:franchise',
        component: AdminCategoriesComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Categories' }
      },
      {
        path: 'categories',
        component: AdminCategoriesComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Categories' }
      },
      {
        path: 'add-category/:franchise',
        component: AddCategoryComponent,
        canActivate: [UserAdminGuard],
        data: { title: 'Add Category' }
      },
      {
        path: 'upload',
        component: AdminUploadComponent,
        canActivate: [UserAdminGuard],
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
        canActivate: [UserAdminGuard],
        data: { title: 'Admin Queue' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AppAdminRoutingModule { }
