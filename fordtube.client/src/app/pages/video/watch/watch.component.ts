import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
  TemplateRef,
  ViewChild,
  Inject,
} from '@angular/core';
import { DOCUMENT, DatePipe } from '@angular/common';
import { VideoService } from '../../../domain/services/video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoDetailsModel } from '../../../domain/interfaces/videodetails.interface';
import { CommentItemModel } from '../../../domain/interfaces/commentitem.interface';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { filter } from 'lodash';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { UserTypeEnum } from '../../../domain/enums/usertype.enum';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReportModel } from '../../../domain/interfaces/report.interface';
import { ClipboardService } from 'ngx-clipboard';
import { debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import { XapiService } from '../../../domain/services/xapi.service';
import { removeEmptyProperties } from '../../../common/utilities/object-utilities';
import { getUrlParameter } from '../../../common/utilities/url-utilities';
import { Statement, Grouping } from '../../../core/xapi/models/xapi.interface';
import { DefinitionType } from '../../../core/xapi/enums/definition-type.enum';
import { CategoryPathModel } from '../../../domain/interfaces/categorypath.interface';
import { XapiTrackingService } from '../../../core/xapi/services/xapi.tracking.service';
import { SafeHtml } from '@angular/platform-browser';
import { SafeEmbedPipe } from '../../../common/pipes/safe-embed/safe-embed.pipe';
import revSdk, {
  IVbrickVideoEmbed,
  PlayerStatus,
  VbrickVideoEmbedConfig,
} from '@vbrick/rev-sdk';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../../core/user/user.service';
import { I18nPluralPipe } from '@angular/common';
import { VerbId } from '../../../core/xapi/enums/verb-id.enum';
import { SafeHtmlPipe } from '../../../common/pipes/safe-html/safe-html.pipe';
import { NameNormalizePipe } from '../../../common/pipes/name-normalize/name-normalize.pipe';

declare global {
  interface Window {
    dataLayer: any[];
  }
  }

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
})
export class WatchComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  ratingByUser = 0;

  private _startAt = 0;
  private _startAtDisplay = '0:00';
  private _copySuccess = new Subject<string>();
  reviewError = '';
  categories = '';
  commentText = '';
  comments: CommentItemModel[] = [];
  copySuccessMessage = '';
  player: IVbrickVideoEmbed;
  duration = 0;
  currentRate = 0.0;
  featuredCategories = '';
  id = '';
  isAdmin = false;
  startTime = new Date(); // Assign a default value to 'startTime'
  flagVideoSubmitLoading = false;
  reportComment = '';
  videoDetails: any;
  reviewSubmitLoading = false;
  startAtEnabled = false;
  shareUrl =
    window.location.href.indexOf('&') < 0
      ? window.location.href
      : window.location.href.substr(0, window.location.href.indexOf('&'));

  shouldStartFromPreDefinedTime = false;
  videoUrl: any;
  videoBaseUrl = environment.vbrickUrl;
  video: any;
  allowedUsersForEdit: any;
  showAdminItemsBasedOnRevAccessEntities = false;
  hasResumedFromPreDefinedTime: any;
  currentTime = 0;
  currentHostName = '';

  get starsId(): string {
    if (
      this.xapiTrackingService.TempStarsId &&
        this.xapiTrackingService.TempStarsId !== 'null'
    ) {
      return this.xapiTrackingService.TempStarsId;
    } else {
      return this.xapiTrackingService.StarsId;
    }
  }

  get courseId(): string {
    if (
      this.xapiTrackingService.TempCourseId &&
        this.xapiTrackingService.TempCourseId !== 'null'
    ) {
      return this.xapiTrackingService.TempCourseId;
    } else {
      return this.xapiTrackingService.CourseId;
    }
  }

  @ViewChild('creditModal', { static: false })
  creditModal!: TemplateRef<any>;

  constructor(
    private router: Router,
    private videoService: VideoService,
    private currentRoute: ActivatedRoute,
    private modalService: NgbModal,
    private clipboardService: ClipboardService,
    private xapiService: XapiService,
    private titleService: Title,
    private xapiTrackingService: XapiTrackingService,
    private safeHtmlPipe: SafeHtmlPipe,
    private safeEmbedPipe: SafeEmbedPipe,
    private datePipe: DatePipe,
    private nameNormalize: NameNormalizePipe,
    private i18nPlural: I18nPluralPipe,
    private zone: NgZone,
    private userService: UserService, // Inject UserService
    @Inject(DOCUMENT) private document: Document // Inject DOCUMENT
  ) {
    this.currentHostName = this.document.location.origin; // Set the currentHostName
  }

  get showAdminItems(): boolean {
    const userRole = this.userService.getUserRoleId();
    return (
      userRole === UserRoleEnum.SUPER_ADMIN ||
        userRole === UserRoleEnum.DEALER_ADMIN
    );
  }

  get startAt() {
    return Math.floor(this._startAt);
  }


  set startAt(startAt: number) {
    if (!startAt || isNaN(startAt)) {
      return;
    }
    this._startAt = startAt;
    this._startAtDisplay = this.secondsToFormattedTime(startAt) || '0:00';
  }

  get startAtDisplay() {
    return this._startAtDisplay;
  }

  set startAtDisplay(startAtDisplay: string) {
    if (
      !startAtDisplay ||
      (startAtDisplay.indexOf(':') !== -1 &&
        startAtDisplay.split(':').length < 2)
    ) {
      return;
    }
    this._startAtDisplay = startAtDisplay;
    this._startAt = this.formattedTimeToSeconds(startAtDisplay);
  }

  getHtmlDescription(details: VideoDetailsModel): SafeHtml {
    if (details.htmlDescription) {
      return this.safeHtmlPipe.transform(details.htmlDescription);
    } else {
      return details.description;
    }
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => {
        console.log(result);
        if (result === 'save') {
          this.flagVideoSubmitLoading = true;
          this.userService.user$.subscribe({
            next: (user) => {
              const model: ReportModel = {
                userName: user ? user.userName.toString() : '',
                name: '',
                videoId: this.id,
                comment: this.reportComment,
                reviewed: false,
              };
              this.videoService.addReport(this.id, model).subscribe({
                next: () => {
                  this.videoDetails.flagged = true;
                },
                error: (error) => console.log('Error: ', error),
                complete: () => {
                  this.flagVideoSubmitLoading = false;
                },
              });
            },
          });
        }
      });
  }

  openReviewModal(content: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
    this.commentText = '';
    this.currentRate = this.ratingByUser;
    this.reviewError = ''; // Fix: Assign an empty string instead of null
  }

  openCreditModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  submitReviewForm(event: MouseEvent, modal: NgbModalRef) {
    event.preventDefault();
    if (this.checkReviewError()) {
      this.reviewSubmitLoading = true;
      this.userService.user$.subscribe({
        next: (user) => {
          this.videoService
            .addReview(this.id,
              {
                comment: this.commentText,
                userName: user ? user.userName : '',
                rating: this.currentRate,
              })
            .subscribe({
              next: (response) => {
                this.comments = response.comments.filter(
                  (element: CommentItemModel) => {
                    element.relativeDate = moment(element.date).fromNow();
                    return (
                      element.isRemoved == null || element.isRemoved === false
                    );
                  }
                );
                this.videoDetails.rating = response.averageRating;
                this.videoDetails.totalRatings = response.totalRatings;
                this.ratingByUser = this.currentRate;

                let payload: Statement = {
                  actor: {
                    name: `${user && user.firstName ? user.firstName : ''} ${user && user.lastName ? user.lastName : ''
                      }`,
                    objectType: 'Agent',
                    account: {
                      homePage:
                        user && user.userTypeId && user.userTypeId === UserTypeEnum.Employee
                          ? 'https://www.wslb2b.ford.com'
                          : 'https://wslx.dealerconnection.com',
                      name: user && user.userName ? user.userName.toString() : '',
                    },
                  },
                  verb: {
                    id: VerbId.REVIEWED,
                    display: {
                      'en-US': 'Reviewed Video',
                    },
                  },
                  context: {
                    contextActivities: {
                      grouping: [
                        {
                          id: window.location.href,
                          definition: {
                            name: {
                              'en-US': this.commentText,
                            },
                            type: DefinitionType.COMMENT,
                          },
                          objectType: 'Activity',
                        },
                        {
                          id: window.location.origin,
                          definition: {
                            name: {
                              'en-US':
                                environment.franchise === 0
                                  ? 'Ford Tube'
                                  : 'Lincoln Video Gallery',
                            },
                            type: DefinitionType.ORGANIZATION,
                          },
                          objectType: 'Activity',
                        },
                      ],
                      other: [
                        {
                          id: this.starsId
                            ? 'https://xapi.ford.com/extension/starsFlag'
                            : '',
                          objectType: this.starsId ? 'Activity' : '',
                        },
                      ],
                    },
                    extensions: {
                      'https://xapi.ford.com/extension/courseid': this.courseId,
                      'https://xapi.ford.com/extension/starsid': this.starsId,
                    },
                  },
                  object: {
                    id: `https://xapi.ford.com/activities/${environment.franchise === 0
                      ? 'fordtube'
                      : 'lincolnvideogallery'
                      }/videos/${this.videoDetails.id}`,
                    objectType: 'Activity',
                    definition: {
                      name: {
                        'en-US': this.videoDetails.title,
                      },
                      type: DefinitionType.REVIEW,
                      description: {
                        'en-US': this.videoDetails.description,
                      },
                      moreInfo:
                        window.location.origin +
                          window.location.pathname +
                          '?v=' +
                          getUrlParameter('v'),
                    },
                  },
                };

                payload = removeEmptyProperties(payload);

                this.xapiService.statements(payload).subscribe();
              },
              error: (error) => {
                this.reviewError = error;
                console.log(error);
              },
              complete: () => {
                modal.close();
                this.reviewSubmitLoading = false;
              },
            });
        },
      });
    }
  }

  openShare(content: any) {
    localStorage.removeItem(this.id);
    this.startAt = parseInt(this.player && this.player.currentTime ? this.player.currentTime.toString() : '0');
    this.modalService.open(content, { size: 'lg', centered: true }).result.then(
      () => {},
      () => {
        this.startAtEnabled = false;
        this.copySuccessMessage = ''; // Fix: Assign an empty string instead of null
      }
    );

    this.userService.user$.subscribe({
      next: (user) => {
        let payload: Statement = {
          actor: {
            name: `${user && user.firstName ? user.firstName : ''} ${user && user.lastName ? user.lastName : ''}`,
            objectType: 'Agent',
            account: {
              homePage:
                user && user.userTypeId && user.userTypeId === UserTypeEnum.Employee
                  ? 'https://www.wslb2b.ford.com'
                  : 'https://wslx.dealerconnection.com',
              name: user && user.userName ? user.userName.toString() : '',
            },
          },
          verb: {
            id: VerbId.SHARE,
            display: {
              'en-US': 'Shared Video',
            },
          },
          context: {
            contextActivities: {
              grouping: [
                {
                  id: this.startAtEnabled
                    ? this.shareUrl + '&t=' + this.startAt
                    : this.shareUrl,
                  definition: {
                    name: {
                      'en-US':
                        environment.franchise === 0
                          ? 'Ford Tube'
                          : 'Lincoln Video Gallery',
                    },
                    type: DefinitionType.ORGANIZATION,
                  },
                  objectType: 'Activity',
                },
              ],
              other: [
                {
                  id: this.starsId
                    ? 'https://xapi.ford.com/extension/starsFlag'
                    : '', // Assign an empty string instead of null
                  objectType: this.starsId ? 'Activity' : '',
                },
              ],
            },
            extensions: {
              'https://xapi.ford.com/extension/courseid': this.courseId,
              'https://xapi.ford.com/extension/starsid': this.starsId,
            },
          },
          object: {
            id: `https://xapi.ford.com/activities/${environment.franchise === 0 ? 'fordtube' : 'lincolnvideogallery'
              }/videos/${this.videoDetails.id}`,
            objectType: 'Activity',
            definition: {
              name: {
                'en-US': this.videoDetails.title,
              },
              type: DefinitionType.VIDEO,
              description: {
                'en-US': this.videoDetails.description,
              },
              moreInfo:
                window.location.origin +
                  window.location.pathname +
                  '?v=' +
                  getUrlParameter('v'),
            },
          },
        };

        payload = removeEmptyProperties(payload);
        this.xapiService.statements(payload).subscribe();
      },
    });
  }

  archive() {
    if (this.videoDetails.archived) {
      this.videoService.unarchive(this.id).subscribe({
        next: () => {
          this.videoDetails.archived = false;
        },
        error: (error) => console.log('Error: ', error),
      });
    } else {
      this.videoService.archive(this.id).subscribe({
        next: () => {
          this.videoDetails.archived = true;
        },
        error: (error) => console.log('Error: ', error),
      });
    }
    return false;
  }

  getAttachmentUrl(id: string | number) {
    return environment.maApiUrl + 'api/video/attached-file/' + id;
  }

  //downloadSupplementalFile(videoid: string, fileid: string, filename: string) {
  //  return (
  //    environment.maApiUrl +
  //    'api/video/' +
  //    videoid +
  //    '/downloadfile/' +
  //    fileid +
  //    '?filename=' +
  //    filename
  //  );
  //}

  //getVideoUrl() {
  //  return environment.maApiUrl + `api/video/download/${this.id}`;
  //}

  copyShareLinkToClipboard() {
    this._copySuccess.subscribe({
      next: (message: string) => (this.copySuccessMessage = message),
    });
    this._copySuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.copySuccessMessage = ''));

    const str = this.startAtEnabled
      ? this.shareUrl + '&t=' + this.startAt
      : this.shareUrl;

    this.clipboardService.copyFromContent(str);

    this._copySuccess.next('Link copied to clipboard');
  }

  private checkReviewError(): boolean {
    if (this.currentRate === 0) {
      this.reviewError = 'Rating is required.';
      return false;
    }

    return true;
  }

  private secondsToFormattedTime(seconds: number) {
    if (!seconds) {
      return null;
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor((seconds % 3600) % 60);
    let result = '';
    if (hrs > 0) {
      result += `${hrs}:${mins < 10 ? '0' : ''}`;
    }
    result += `${mins}:${secs < 10 ? '0' : ''}`;
    result += `${secs}`;
    return result;
  }

  private formattedTimeToSeconds(time: string): number {
    if (!time || time.indexOf(':') === -1) {
      time = time || '0:00';
      return Math.floor(parseInt(time, 10));
    }
    const timeParts = time.split(':');
    return Math.floor(
      parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10)
    );
  }

  private secondsToRevPlayerStartTimeFormat(seconds: number): string {
    let MM: string | number;
    let SS: string | number;

    MM = Math.floor((seconds % 3600) / 60);
    SS = seconds % 60;

    if (MM < 10) {
      MM = `0${MM}`;
    }
    if (SS < 10) {
      SS = `0${SS}`;
    }
    return `${MM}m${SS}s`;
  }

  private updateLrsParameters() {
    if (this.currentRoute.snapshot.queryParamMap.has('starsid')) {
      this.xapiTrackingService.TempStarsId =
        this.currentRoute.snapshot.queryParamMap.get('starsid') || '';
    }

    if (this.currentRoute.snapshot.queryParamMap.has('coursecode')) {
      this.xapiTrackingService.TempCourseId =
        this.currentRoute.snapshot.queryParamMap.get('coursecode') || '';
    }
  }

  ngOnInit() {
    this.id = this.currentRoute.snapshot.queryParamMap.get('v') || '';

    if (this.id === '') {
      this.router.navigate(['/']);
    }

    const timeParam = this.currentRoute.snapshot.queryParamMap.get('t') || '';

    if (timeParam !== '' || parseFloat(localStorage.getItem(this.id) || '')) {
      this.shouldStartFromPreDefinedTime = true;
    }

    this.videoUrl = this.safeEmbedPipe.transform(this.videoBaseUrl + this.id);

    this.updateLrsParameters();

    // Ensure the user's viewframe contains the video player
    window.scrollTo({ top: 0 });

    this.currentRoute.data.subscribe({
      next: (data): void => {
        if (
          data['videoPlaybackUrlResponse'] &&
            data['videoPlaybackUrlResponse'].video
        ) {
          this.video = data['videoPlaybackUrlResponse'].video;
        }
      },
    });

    this.currentRoute.data.subscribe({
      next: (data): void => {
        this.videoDetails = data['videoDetailsResponse'];
      },
      error: (err) => {
        console.error('Error loading video details:', err);
      },
      complete: () => {
        console.log('Video details loading complete');
      }
    });

    this.currentRoute.data.subscribe({
      next: (data): void => {
        if (data['videoCommentsResponse'] && data['videoCommentsResponse'].comments) {
          this.comments = filter(
            data['videoCommentsResponse'].comments,
            (comment: CommentItemModel) => {
              comment.relativeDate = moment(comment.date).fromNow();
              return comment.isRemoved == null || comment.isRemoved === false;
            }
          );
        }
      },
    });

    if (this.video) {
      this.categories = this.video.categories
        .map((c: { fullpath: any }) => c.fullpath)
        .join(', ');
      this.featuredCategories = this.video.featuredCategories.join(', ');
    }

    this.currentRate = 0;
    this.ratingByUser = this.videoDetails.ratingByUser || 0;

    this.allowedUsersForEdit = this.videoDetails.accessControlEntities
      .filter((item: { type: string }) => item.type === 'User')
      .map((item: { id: any }) => item.id);

    if (this.allowedUsersForEdit.length > 0) {
      this.userService.user$.subscribe({
        next: (user) => {
          if (user && this.allowedUsersForEdit.includes(user.userName)) {
            this.showAdminItemsBasedOnRevAccessEntities = true;
          }
        },
      });
    }
  }

  ngAfterViewInit(): void {
    window['dataLayer'] =
      window['dataLayer'].filter(
        (obj: { event: string }) =>
        obj.event !== 'vPageview' && obj.event !== 'historyChange'
      ) ||
      [];

    window['dataLayer'].push({
      event: 'vPageview',
      pageUrl: window.location,
      pageTitle: this.video.title,
    });

    window['dataLayer'].push({
      event: 'historyChange',
    });

    const token = {};

    const playerOptions: VbrickVideoEmbedConfig = {
      baseUrl: environment.vbrickUrl,
      log: true,
      popupAuth: true,
      ...token
    };

    if (this.currentRoute.snapshot.queryParamMap.get('t') !== null ||
      parseFloat(localStorage.getItem(this.id) || '') > 0) {
      const timeToSkipTo = parseInt(this.currentRoute.snapshot.queryParamMap.get('t') || localStorage.getItem(this.id));
      const configTimeToStartAt = this.secondsToRevPlayerStartTimeFormat(timeToSkipTo);
      playerOptions.startAt = configTimeToStartAt;

      if (this.currentRoute.snapshot.queryParamMap.get('t')) {
        const categories: Grouping[] = [];

        this.videoDetails.categoryPaths.forEach((value: CategoryPathModel) => {
          categories.push({
            id: `https://forddealersrev.dealerconnection.com/#/media/videos/category/${value.categoryId}`,
            definition: {
              name: {
                'en-US': value.name,
              },
              type: DefinitionType.CATEGORY,
            },
            objectType: 'Activity',
          });
        });

        this.userService.user$.subscribe({
          next: (user) => {
            let payload: Statement = {
              actor: {
                name: `${user && user.firstName ? user.firstName : ''} ${user && user.lastName ? user.lastName : ''}`,
                objectType: 'Agent',
                account: {
                  homePage: user && user.userTypeId && user.userTypeId === UserTypeEnum.Employee
                    ? 'https://www.wslb2b.ford.com'
                    : 'https://wslx.dealerconnection.com',
                  name: user && user.userName ? user.userName.toString() : '',
                },
              },
              verb: {
                id: VerbId.START,
                display: {
                  'en-US': 'Started Video',
                },
              },
              context: {
                contextActivities: {
                  grouping: [
                    {
                      id: window.location.origin,
                      definition: {
                        name: {
                          'en-US':
                            environment.franchise === 0
                              ? 'Ford Tube'
                              : 'Lincoln Video Gallery',
                        },
                        type: DefinitionType.ORGANIZATION,
                      },
                      objectType: 'Activity',
                    },
                    ...categories,
                  ],
                  other: [
                    {
                      id: this.starsId
                        ? 'https://xapi.ford.com/extension/starsFlag'
                        : '',
                      objectType: this.starsId ? 'Activity' : '',
                    },
                  ],
                },
                extensions: {
                  'https://xapi.ford.com/extension/courseid': this.courseId,
                  'https://xapi.ford.com/extension/starsid': this.starsId,
                },
              },
              object: {
                id: window.location.href,
                objectType: 'Activity',
                definition: {
                  name: {
                    'en-US': this.videoDetails.title,
                  },
                  type: DefinitionType.VIDEO,
                  description: {
                    'en-US': this.videoDetails.description,
                  },
                  moreInfo:
                    window.location.origin +
                      window.location.pathname +
                      '?v=' +
                      getUrlParameter('v'),
                },
              },
            };

            payload = removeEmptyProperties(payload);

            this.xapiService.statements(payload).subscribe();
          },
        });
      }
    }

    this.player = revSdk.embedVideo('#embed', this.id, playerOptions);

    this.player.on('playerStatusChanged',
      (e) => {
        if (e.status === PlayerStatus.Playing) {
          this.startTime = new Date();
        }

        if (this.player) {
          if (e.status === PlayerStatus.Ended) {
            const categories: Grouping[] = [];

            this.videoDetails.categoryPaths.forEach(
              (value: CategoryPathModel) => {
                categories.push({
                  id: `https://forddealersrev.dealerconnection.com/#/media/videos/category/${value.categoryId}`,
                  definition: {
                    name: {
                      'en-US': value.name,
                    },
                    type: DefinitionType.CATEGORY,
                  },
                  objectType: 'Activity',
                });
              }
            );

            let currentStartTime: number;
            if (this.startTime && this.startTime.getTime()) {
              currentStartTime = this.startTime.getTime();
            } else {
              currentStartTime = new Date(
                new Date().getTime() - 30 * 60000
              ).getTime();
            }

            const watchDuration = moment.duration(
              new Date().getTime() - currentStartTime
            );

            this.userService.user$.subscribe({
              next: (user) => {
                let payload: Statement = {
                  actor: {
                    name: `${user && user.firstName ? user.firstName : ''} ${user && user.lastName ? user.lastName : ''
                      }`,
                    objectType: 'Agent',
                    account: {
                      homePage:
                        user && user.userTypeId && user.userTypeId === UserTypeEnum.Employee
                          ? 'https://www.wslb2b.ford.com'
                          : 'https://wslx.dealerconnection.com',
                      name: user && user.userName ? user.userName.toString() : '',
                    },
                  },
                  verb: {
                    id: VerbId.COMPLETE,
                    display: {
                      'en-US': 'Completed Video',
                    },
                  },
                  context: {
                    contextActivities: {
                      grouping: [
                        {
                          id: window.location.origin,
                          definition: {
                            name: {
                              'en-US':
                                environment.franchise === 0
                                  ? 'Ford Tube'
                                  : 'Lincoln Video Gallery',
                            },
                            type: DefinitionType.ORGANIZATION,
                          },
                          objectType: 'Activity',
                        },
                        ...categories,
                      ],
                      other: [
                        {
                          id: this.starsId
                            ? 'https://xapi.ford.com/extension/starsFlag'
                            : '',
                          objectType: this.starsId ? 'Activity' : '',
                        },
                      ],
                    },
                    extensions: {
                      'https://xapi.ford.com/extension/courseid': this.courseId,
                      'https://xapi.ford.com/extension/starsid': this.starsId,
                    },
                  },
                  object: {
                    id: `https://xapi.ford.com/activities/${environment.franchise === 0
                      ? 'fordtube'
                      : 'lincolnvideogallery'
                      }/videos/${this.videoDetails.id}`,
                    objectType: 'Activity',
                    definition: {
                      name: {
                        'en-US': this.videoDetails.title,
                      },
                      type: DefinitionType.VIDEO,
                      description: {
                        'en-US': this.videoDetails.description,
                      },
                      moreInfo:
                        window.location.origin +
                          window.location.pathname +
                          '?v=' +
                          getUrlParameter('v'),
                    },
                  },
                  result: {
                    duration: `P0Y0M0DT${watchDuration.hours()}H${watchDuration.minutes()}M${watchDuration.seconds()}S`,
                  },
                };

                payload = removeEmptyProperties(payload);

                this.xapiService.statements(payload).subscribe({
                  next: (response: any) => {
                    console.log(
                      'Credit info sent ',
                      this.starsId,
                      this.courseId,
                      response
                    );

                    if (this.starsId !== null && this.courseId !== null) {
                      this.openCreditModal(this.creditModal);
                    }
                  },
                  error: (error: any) => {
                    console.log('Credit Error: ', error);
                  },
                });

                localStorage.setItem(this.id, '0');
              },
            });
          }

        }
      });
  }

  ngOnDestroy() {
    window['dataLayer'].push({
      event: 'historyChange',
    });
  }

  getVideoUrl() {
    this.videoService.download(this.id).subscribe(data => {
      const filename = this.id + '.mp4';
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }));
      // if (filename)
      downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

    });
  }

  downloadSupplementalFile(videoid: string, fileid: string, filename: string) {
    this.videoService.downloadSupplementalFile(videoid, fileid, filename).subscribe(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }));
      // if (filename)
      downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

    });
  }
}
