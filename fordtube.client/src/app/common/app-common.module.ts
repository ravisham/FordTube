import { CommonModule, DatePipe, I18nPluralPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbDateAdapter, NgbModule, NgbTimeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { LoadMoreDirective } from './load-more/directives/load-more.directive';
import { LoadMoreComponent } from './load-more/load-more.component';
import { LoadMoreService } from './load-more/services/load-more.service';
import { VideosListComponent } from './videos-list/videos-list.component';
import { NameAbbreviatedPipe } from './pipes/name-abbreviated/name-abbreviated.pipe';
import { VideoCategoryListResolverService } from './resolvers/categories/category-list-resolver/video-category-list-resolver.service';
import { VideoListResolverService } from './resolvers/videos/list-resolver/video-list-resolver.service';
import { VideoFeaturedCategoryListResolverService } from './resolvers/categories/featured-category-list-resolver/video-featured-category-list-resolver.service';
import { VideoCommentsResolverService } from './resolvers/videos/comments-resolver/video-comments-resolver.service';
import { VideoPlaybackUrlResolverService } from './resolvers/videos/playback-url-resolver/video-playback-url-resolver.service';
import { VideoDetailsResolverService } from './resolvers/videos/details-resolver/video-details-resolver.service';
import { EventsListComponent } from './events-list/events-list.component';
import { StripHtmlPipe } from './pipes/strip-html/strip-html.pipe';
import { SafeHtmlPipe } from './pipes/safe-html/safe-html.pipe';
import { ToArrayPipe } from './pipes/comma-seperated/to-array.pipe';
import { FromArrayPipe } from './pipes/comma-seperated/from-array.pipe';
import { EventsListResolverService } from './resolvers/events/events-list-resolver/events-list-resolver.service';
import { StandaloneVideoIdResolverService } from './resolvers/videos/standalone-id-resolver/standalone-video-id-resolver.service';
import { MarketGroupsResolverService } from './resolvers/groups/market-groups-resolver/market-groups-resolver';
import { RoleGroupsResolverService } from './resolvers/groups/role-groups-resolver/role-groups-resolver';
import { FranchiseListResolverService } from './resolvers/categories/franchise-list-resolver/franchise-list-resolver';
import { SafeEmbedPipe } from './pipes/safe-embed/safe-embed.pipe';
import { CalendarEventService } from './calendar/services/calendar-event.service';
import { SafeUrlPipe } from './pipes/safe-url/safe-url.pipe';
import { SQLNgbDateAdapter } from './formatters/dates/sql-ngb-date-model-formatter';
import { SQLNgbTimeAdapter } from './formatters/dates/sql-ngb-time-model-formatter';
import { NameNormalizePipe } from './pipes/name-normalize/name-normalize.pipe';
import { EncryptionService } from './encryption/encryption.service';
import { SortByPipe } from './pipes/sort-by/sort-by.pipe';
import { TruncatePipe } from './pipes/truncate/truncate-pipe.pipe';
import { DurationPipe } from './pipes/time/duration.pipe';
import { SubmitButtonComponent } from './submit-button/submit-button.component';
import { FileSizePipe } from './pipes/file-size/file-size.pipe';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    RouterModule,
    FormsModule
  ],
  declarations: [
    DurationPipe,
    LoadMoreDirective,
    LoadMoreComponent,
    VideosListComponent,
    NameAbbreviatedPipe,
    EventsListComponent,
    SafeHtmlPipe,
    StripHtmlPipe,
    ToArrayPipe,
    FileSizePipe,
    FromArrayPipe,
    SafeEmbedPipe,
    SafeUrlPipe,
    SortByPipe,
    NameNormalizePipe,
    TruncatePipe,
    SubmitButtonComponent
  ],
  exports: [
    DurationPipe,
    LoadMoreDirective,
    LoadMoreComponent,
    VideosListComponent,
    FileSizePipe,
    NameAbbreviatedPipe,
    EventsListComponent,
    SafeHtmlPipe,
    StripHtmlPipe,
    ToArrayPipe,
    FromArrayPipe,
    SafeEmbedPipe,
    SafeUrlPipe,
    SortByPipe,
    NameNormalizePipe,
    TruncatePipe,
    SubmitButtonComponent
  ],
  providers: [
    DurationPipe,
    CalendarEventService,
    EventsListResolverService,
    FranchiseListResolverService,
    LoadMoreService,
    EncryptionService,
    MarketGroupsResolverService,
    RoleGroupsResolverService,
    StandaloneVideoIdResolverService,
    DatePipe,
    I18nPluralPipe,
    FileSizePipe,
    StripHtmlPipe,
    SafeHtmlPipe,
    SafeEmbedPipe,
    SortByPipe,
    NameNormalizePipe,
    TruncatePipe,
    VideoCategoryListResolverService,
    VideoCommentsResolverService,
    VideoDetailsResolverService,
    VideoFeaturedCategoryListResolverService,
    VideoListResolverService,
    VideoPlaybackUrlResolverService,
    [{ provide: NgbDateAdapter, useClass: SQLNgbDateAdapter }],
    [{ provide: NgbTimeAdapter, useClass: SQLNgbTimeAdapter }]
  ],
})
export class AppCommonModule { }
