import { UserRoleEnum } from './../../domain/enums/userroletype.enum';
import { DisclaimerService } from '../../domain/services/disclaimer.service';
import { Component, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { SideNavService } from '../side-nav/services/side-nav.service';
import { HeaderSearchService } from '../header-search/services/header-search.service';
import { getCookie } from '../../common/utilities/cookie-utilities';
import { NgbModal, NgbModalRef, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { StarsService } from '../../domain/services/stars.service';
import { XapiTrackingService } from '../../core/xapi/services/xapi.tracking.service';
import {
  getFirstName,
  getLastName,
} from '../../common/utilities/username-utilities';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserTypeEnum } from '../../domain/enums/usertype.enum';
import { ActivatedRoute } from '@angular/router';
import Nonovvm = UserTypeEnum.Nonovvm;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements AfterViewInit, AfterContentInit {
  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(message: string) {
    this._errorMessage = message;
  }

  get welcomeMessage() {
    return `Welcome ${getFirstName()} ${getLastName()}`;
  }

  get isDealer() {
    return (
      getCookie('acigroup') === 'Dealer' ||
      parseInt(getCookie('userRoleId'), 10) === UserRoleEnum.DEALER ||
      parseInt(getCookie('userRoleId'), 10) === UserRoleEnum.DEALER_ADMIN
    );
  }

  get isEmployee(): boolean {
    const userType = parseInt(getCookie('userTypeId'), 10);
    return (
      userType === Nonovvm ||
      getCookie('acigroup') === 'Nonovvm' ||
      getCookie('acigroup') === 'Employee'
    );
  }

  public get shouldShowBrowserAlert() {
    return this._shouldShowBrowserAlert;
  }
  public set shouldShowBrowserAlert(value) {
    this._shouldShowBrowserAlert = value;
  }

  get IsOpen() {
    return this.sideNavService.isMenuOpen;
  }

  constructor(
    private sideNavService: SideNavService,
    private headerSearchService: HeaderSearchService,
    private currentRoute: ActivatedRoute,
    private modalService: NgbModal,
    private starsService: StarsService,
    private xapiTrackingService: XapiTrackingService,
    private disclaimerService: DisclaimerService
  ) {}
  private _errorMessage: string;
  private _shouldShowBrowserAlert = true;

  shouldDisplayStarsAlert = false;

  hasCheckedDoNotDisplay = false;

  modal: NgbModalRef;

  starsIdField: string = '';

  shouldShowCourseWatchToCompletionMessage = false;

  @ViewChild('disclaimerModalContent', { static: false })
  private disclaimerModalContent: any;
  starsId = () => {
    return (
      this.xapiTrackingService.TempStarsId || this.xapiTrackingService.StarsId
    );
  }

  openModal(content: any) {
    this.errorMessage = null;
    this.modal = this.modalService.open(content);
  }

  closeBrowserAlertHandler(alert: NgbAlert) {
    this.shouldShowBrowserAlert = false;
  }

  closeCourseVideoCompletionMessageHandler(alert: NgbAlert){
    this.shouldShowCourseWatchToCompletionMessage = false;
  }

  closeHandler(alert: NgbAlert) {
    this.shouldDisplayStarsAlert = false;
    this.errorMessage = null;
    sessionStorage.setItem('viewedStarsAlert', 'true');
  }

  toggleSearch() {
    this.headerSearchService.setToggleSearch();
  }

  toggle($event: Event) {
    $event.preventDefault();
    this.sideNavService.setToggleMenu();
  }

  saveStarsChanges(
    event: MouseEvent,
    starsIdField: string,
    modal: NgbModalRef,
    alert: NgbAlert
  ) {
    const originalStarsId = this.xapiTrackingService.StarsId;
    this.starsService
      .post(getCookie('userid'), starsIdField.toString())
      .subscribe(
        (response: string) => {
          this.xapiTrackingService.StarsId =
            starsIdField.toString() || response;
          this.xapiTrackingService.TempStarsId = null;
          this.errorMessage = null;

          if (alert) {
            this.closeHandler(alert);
          }

          if (modal) {
            modal.close();
          }
        },

        (error) => {
          this.errorMessage = error.error;
          this.xapiTrackingService.StarsId = originalStarsId;
        }
      );
  }

  saveDisclaimerAcknowledgement(event: MouseEvent, modal: NgbModalRef) {
    if (this.hasCheckedDoNotDisplay) {
      this.updateDisclaimerCheck();
    } else {
      sessionStorage.setItem('viewedDisclaimerModal', 'true');
    }
    modal.close();
  }

  ngAfterViewInit(): void {
    this.initializeStarsUpdateCheck();
    this.initializeDisclaimerCheck();
  }

  ngAfterContentInit(): void {
    this.initializeBrowserCompatibilityCheck();
    this.initializeCourseWatchToCompletionMessageCheck();
  }

  private initializeCourseWatchToCompletionMessageCheck(): void {
    if(this.xapiTrackingService.TempStarsId || this.xapiTrackingService.TempCourseId || this.currentRoute.snapshot.queryParamMap.get('coursecode') || this.currentRoute.snapshot.queryParamMap.get('starsid')) {
      this.shouldShowCourseWatchToCompletionMessage = true;
    }
  }

  private initializeStarsUpdateCheck(): void {
    if (this.currentRoute.snapshot.queryParamMap.get('coursecode')) {
      this.xapiTrackingService.TempCourseId = this.currentRoute.snapshot.queryParamMap.get(
        'coursecode'
      );
    }

    if (this.currentRoute.snapshot.queryParamMap.get('starsid')) {
      const starsIdFromQueryString = this.currentRoute.snapshot.queryParamMap.get(
        'starsid'
      );
      this.starsIdField = starsIdFromQueryString;
      this.xapiTrackingService.StarsId = starsIdFromQueryString;

      return;
    }

    this.starsService.get(getCookie('userid')).subscribe((response) => {
      if (response !== null) {
        // User has stored a Stars Id
        this.xapiTrackingService.StarsId = response;
        this.starsIdField = response;
        // Ensure the user is not an employee?
        if (!this.isEmployee) {
          // Check if it has been 90 Days since we last prompted the user (happens on the back-end).
          this.starsService
            .showUpdateStars(getCookie('userid'))
            .subscribe((shouldUpdate) => {
              if (Boolean(shouldUpdate)) {
                this.shouldDisplayStarsAlert = true;
              }
            });
        }

        // User has no stars Id, and they are a dealer.
      } else if (this.isDealer) {
        this.shouldDisplayStarsAlert = true;
      }
    });
  }

  private initializeDisclaimerCheck(): void {
    this.disclaimerService.showUpdateDisclaimer(getCookie('userid')).subscribe(
      (response: boolean) => {
        if (
          Boolean(response) &&
          sessionStorage.getItem('viewedDisclaimerModal') !== 'true'
        ) {
          this.modalService.open(this.disclaimerModalContent);
        }
      },
      (error) => {
        console.error(error);
        this.modalService.open(this.disclaimerModalContent);
      }
    );
  }


  private initializeBrowserCompatibilityCheck(): void {
    const checkIsIeViaBrowserFeatures = document['documentMode'];
    this.shouldShowBrowserAlert = checkIsIeViaBrowserFeatures || navigator.userAgent.indexOf("MSIE") > 0;
  }

  private updateDisclaimerCheck(): Subscription {
    return this.disclaimerService
      .updateDisclaimerLastSeen(getCookie('userid'))
      .subscribe(() => {
        if (sessionStorage.getItem('viewedDisclaimerModal') !== 'true') {
          sessionStorage.setItem('viewedDisclaimerModal', 'true');
        }
      });
  }
}
