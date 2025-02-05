import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoryModel } from '../../../domain/interfaces/category.interface';
import { VideoService } from '../../../domain/services/video.service';
import { CategoriesService } from '../../../domain/services/categories.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { VideoDetailsModel } from '../../../domain/interfaces/videodetails.interface';
import { EditVideoModel } from '../../../domain/interfaces/editvideo.interface';
import { FranchiseType } from '../../../domain/enums/franchisetype.enum';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpRequest } from '@angular/common/http';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { getCookie } from '../../../common/utilities/cookie-utilities';
import { flattenDeep } from 'lodash';
import { GetCategoryModel } from '../../../domain/interfaces/getcategory.interface';
import { UserTypeEnum } from '../../../domain/enums/usertype.enum';
import { UserGroupModel } from '../../../domain/interfaces/usergroup.interface';
import { VideoAccessControlType } from '../../../domain/enums/videoaccesscontroltype.enum';
import { AccessControlEntityModel } from '../../../domain/interfaces/accesscontrolentity.interface';
import { UsersService } from '../../../domain/services/users.service';
import { UserModel } from '../../../domain/interfaces/user.interface';
import Dealer = UserTypeEnum.Dealer;
import { formatDate, DatePipe } from '@angular/common';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-video',
  templateUrl: './edit-video.component.html',
  styleUrls: ['./edit-video.component.scss']
})
export class EditVideoComponent implements OnInit, OnDestroy, AfterViewInit {
  videoDetails: VideoDetailsModel;
  id: string;
  form: FormGroup;
  fileChoosen = false;
  loading: boolean;
  franchiseCategories: CategoryModel[];
  fileLabel = 'Add Video';
  docfileLabel1 = 'Add Document';
  docfileLabel2 = 'Add Document';
  docfileLabel3 = 'Add Document';
  thumbnailFileLabel = 'Add Thumbnail';
  srtfileLabel = 'Add .srt file';
  progress = 0;
  categories: GetCategoryModel[];
  selected_categories: GetCategoryModel[];
  categoriesByFranchise = [];
  progressInterval = null;
  progressLabel = 'File is uploading...';
  progressStep: number;
  redirectOnAdmin = null;
  submitClicked = false;
  filesMessage = '';
  showFileAlert = false;
  srtMessage = '';
  showSrtAlert = false;
  allowedExtensions = ['pptx', 'docx', 'pdf', 'xlsx', 'doc', 'ppt', 'xls'];
  marketGroups: UserGroupModel[];
  marketGroupsCheckboxes: boolean[];
  roleGroups: UserGroupModel[];
  roleGroupsCheckboxes: boolean[];
  allowedUsersForEdit: string[];
  canEdit = true;
  _boolexpiration: boolean = false;
  private _videoFileSizeErrorMessage = '';
  public get videoFileSizeErrorMessage() {
    return this._videoFileSizeErrorMessage;
  }
  public set videoFileSizeErrorMessage(value) {
    this._videoFileSizeErrorMessage = value;
  }

  @ViewChild('fileInput', { static: false })
  fileInput: ElementRef;
  @ViewChild('srtFile', { static: false })
  srtInput: ElementRef;



  constructor(
    private formBuilder: FormBuilder,
    private dataService: VideoService,
    private router: Router,
    private categoriesService: CategoriesService,
    private currentRoute: ActivatedRoute,
    private userService: UsersService,
    private http: HttpClient, public datepipe: DatePipe
  ) { }    

  checkFileSize(files: FileList): boolean {

    if(!files || !files.length) {
      this.videoFileSizeErrorMessage = "";
      return true;
    }

    let totalSize = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalSize = + file.size;
    }

    //Under
    if (totalSize <= 2147483648) {
      this.videoFileSizeErrorMessage = "";
      return true;
    }

    this.videoFileSizeErrorMessage = "The file size limit is 2GB";
    return false;
  }

  upload(files) {
    if (files.length === 0) {
      return;
    }
    this.fileChoosen = true;
    this.fileLabel = files[0].name;
    this.form.get('videoFile').setValue(files[0]);
  }

  uploadSrt(files) {
    if (files.length === 0) {
      return;
    }
    const extension = files[0].name.split('.').pop();
    if (extension !== 'srt') {
      this.filesMessage = 'Allowed file type is SRT';
      this.showFileAlert = true;
      this.srtInput.nativeElement.value = '';
      this.srtfileLabel = 'Add .srt file';
    } else {
      this.srtfileLabel = files[0].name;
      this.form.get('srtFile').setValue(files[0]);
    }
  }

  isExpirationDateDisabled(date) {
    if ((document.getElementById('publishDatePicker') as HTMLInputElement).value) {
      let pubDate = new Date((document.getElementById('publishDatePicker') as HTMLInputElement).value + "T00:00:00");
      let npubDate = pubDate;
      let expirationDate = pubDate;
      let d = pubDate;
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      expirationDate = new Date(year + 1, month, day);

      const d2 = new Date(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate());
      const d3 = new Date(date.year, date.month - 1, date.day);
      return d3 > d2 || npubDate > d3;
    }
    else {
      const d = new Date(date.year, date.month - 1, date.day + 1);
      const d2 = new Date(date.year - 1, date.month - 1, date.day);
      return d2 > new Date() || d <= new Date();
    }  
  }

  isPublishDateDisabled(date) {
    const d = new Date(date.year, date.month - 1, date.day + 1);
    const d2 = new Date(date.year - 2, date.month - 1, date.day);
    return d2 > new Date() || d < new Date();
  }

  uploadThumbnail(files) {
    if (files.length === 0) {
      return;
    }
    this.thumbnailFileLabel = files[0].name;
    this.form.get('thumbnailFile').setValue(files[0]);
  }

  changeMarket(ind: number) {
    this.marketGroupsCheckboxes[ind] = !this.marketGroupsCheckboxes[ind];
  }

  changeRole(ind: number) {
    this.roleGroupsCheckboxes[ind] = !this.roleGroupsCheckboxes[ind];
  }

  uploadFile(files, index) {
    if (files.length === 0) {
      return;
    }
    this.showFileAlert = false;
    if (files[0].size > 52428800) {
      this.filesMessage = 'Maximum file size is 50 Mb';
      this.showFileAlert = true;
    }
    if (this.checkExtension(files[0].name)) {
      this.filesMessage = 'Allowed file types are PDF, Word, Excel and PowerPoint';
      this.showFileAlert = true;
    }
    if (this.showFileAlert) {
      switch (index) {
        case 1:
          this.docfileLabel1 = 'Add Document';
          break;
        case 2:
          this.docfileLabel2 = 'Add Document';
          break;
        case 3:
          this.docfileLabel3 = 'Add Document';
          break;
      }
      return;
    }
    switch (index) {
      case 1:
        this.docfileLabel1 = files[0].name;
        break;
      case 2:
        this.docfileLabel2 = files[0].name;
        break;
      case 3:
        this.docfileLabel3 = files[0].name;
        break;
    }
    this.form.get('docFile' + index).setValue(files[0]);
  }

  checkExtension(fileName): boolean {
    const extension = fileName.split('.').pop();
    return this.allowedExtensions.filter(ex => ex === extension).length === 0;
  }
  formatISODate(dateString: string): string {
    const parts = dateString.split('-');

    const year = parts[0];
    const month = parts[1].padStart(2, '0'); // Add leading zero if necessary
    const day = parts[2].padStart(2, '0'); // Add leading zero if necessary

    return `${year}-${month}-${day}`;
  }
  onSubmit() {

    if (this.form.get('expirationDate').value == null) {
      let pubDate = this.form.get('publishDate').value;
      if (pubDate.length <= 10) {
        pubDate = this.formatISODate(pubDate) + "T00:00:00";
      }
      let d = new Date(pubDate);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      this.form.patchValue({
        expirationDate: this.datepipe.transform(new Date(year + 1, month, day), 'yyyy-MM-dd')
      });
    }
    else {
      let publishDate = this.form.get('publishDate').value;
      if (publishDate.length <= 10) {
        publishDate = this.formatISODate(publishDate) + "T00:00:00";
      }
      let d = new Date(publishDate)
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      const _eDate = new Date(year + 1, month, day)
      let expirationDate = this.form.get('expirationDate').value;
      if (expirationDate.length <= 10) {
        expirationDate = this.formatISODate(expirationDate) + "T00:00:00";
      }
      const expDate: Date = new Date(expirationDate);
      const pubDate: Date = new Date(publishDate);

      if ((expDate >= pubDate) && (expDate <= _eDate)) {
        this._boolexpiration = false;
      } else {
        this._boolexpiration = true;
        return;
      }
    }
    this.submitClicked = true;
    console.log(`onSubmit called ${this.isValid()}`);
    if (this.isValid()) {
      const formModel = this.form.value;
      this.loading = true;
      const formData: EditVideoModel = {
        expirationDate: formModel.expirationDate ? formModel.expirationDate : this.defaultExpirationDate(),
        publishDate: formModel.publishDate,
        id: this.id,
        title: formModel.title,
        description: formModel.description,
        categories: this.selected_categories.map(c => c.categoryId),
        tags: formModel.tag.split(';').filter(function (el) {
          return el !== '';
        }),
        businessOwnerName: formModel.businessOwnerName,
        businessOwnerEmail: formModel.businessOwnerEmail,
        contactsName: formModel.contactsName,
        contactsEmail: formModel.contactsEmail,
        notes: formModel.notes,
        is360: formModel.videoFile != null && formModel.is360,
        enableDownloads: formModel.enableDownload,
        videoAccessControl: formModel.restricted ? VideoAccessControlType.Private : VideoAccessControlType.AllUsers,
        accessControlEntities: this.getGroups(formModel.restricted),
        srtFileName: ''
      };
      const editData = new FormData();
      editData.append('model', JSON.stringify(formData));
      if (formModel.videoFile != null) {
        editData.append('video', formModel.videoFile);
      }
      if (formModel.docFile1 != null) {
        editData.append('doc1', formModel.docFile1);
      }
      if (formModel.docFile2 != null) {
        editData.append('doc2', formModel.docFile2);
      }
      if (formModel.docFile3 != null) {
        editData.append('doc3', formModel.docFile3);
      }
      if (formModel.thumbnailFile != null) {
        editData.append('thumbnail', formModel.thumbnailFile);
      }
      if (formModel.srtFile != null) {
        editData.append('srt', formModel.srtFile);
      }

      const uploadReq = new HttpRequest('POST', `${environment.maApiUrl}api/Video/edit-video2/${this.id}`, editData, {
        reportProgress: true
      });

      const startTime: any = new Date();
      this.http.request(uploadReq).subscribe(event => {
        const time = new Date();
        if (event.type === HttpEventType.UploadProgress) {
          console.log('Progress  ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ':' + time.getMilliseconds());
          console.log(event);
          this.progress = Math.round((50 * event.loaded) / event.total);
          this.progressLabel = `Uploaded ${this.progress}% (${event.loaded} from ${event.total} bytes)`;
          if (event.loaded === event.total) {
            const finishTime: any = new Date();
            const diff: number = finishTime - startTime;
            this.progressStep = 10000 / diff;
            console.log(this.progressStep);
            this.progressLabel = 'File has been uploaded. Waiting for response from VBrick...';
            this.progressInterval = setInterval(() => {
              console.log('setInterval called');
              this.progress += Math.min(this.progressStep, 100 - this.progress);
              console.log(`Progress ${this.progress}`);
              if (this.progress >= 100) {
                if (this.progressInterval != null) {
                  console.log('clearInterval called');
                  clearInterval(this.progressInterval);
                  this.progressInterval = null;
                }
              }
            }, 200);
          }
        } else if (event.type === HttpEventType.Response) {
          if (this.progressInterval != null) {
            console.log('clearInterval called');
            clearInterval(this.progressInterval);
            this.progressInterval = null;
          }
          console.log('Done ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ':' + time.getMilliseconds());
          console.log(event);
          this.uploadingFinished(event);
        }
      });
    } else {
      this.scrollToError();
    }

    return false;
  }

  scrollToError() {
    if (this.isOfficialRequest && !this.form.controls.businessOwnerName.valid) {
      document.getElementById('businessOwnerName').scrollIntoView(false);
      return;
    }
    if (this.isOfficialRequest && !this.form.controls.businessOwnerEmail.valid) {
      document.getElementById('businessOwnerEmail').scrollIntoView(false);
      return;
    }
    if (this.isOfficialRequest && !this.isContactEmailsValid()) {
      document.getElementById('contactsEmail').scrollIntoView(false);
      return;
    }
    if (!this.form.controls.title.valid) {
      document.getElementById('contactsEmail').scrollIntoView(false);
      return;
    }
    if (!this.form.controls.description.valid) {
      console.log('scroll to description');
      document.getElementById('tag').scrollIntoView(false);
      return;
    }
    if (!this.isTagValid()) {
      document.getElementById('tag').scrollIntoView(false);
      return;
    }
    if (this.form.value.isOfficialRequest && !this.isPublishDateValid()) {
      document.getElementById('thumbnail').scrollIntoView(false);
      return;
    }
  }

  defaultExpirationDate(): Date {
    const userType = parseInt(getCookie('userTypeId'), 10);
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    if (userType === Dealer) {
      return new Date(year + 1, month, day);
    } else {
      return new Date(year + 1, month, day);
    }
  }

  getFranchiseId() {
    if (environment.franchise === FranchiseType.Ford) {
      return [this.franchiseCategories[1].categoryId];
    } else {
      return [this.franchiseCategories[2].categoryId];
    }
  }

  uploadingFinished(result) {
    this.loading = false;
    if (this.redirectOnAdmin != null) {
      this.router.navigate(['admin/queue']);
    } else {
      this.router.navigate(['manage']);
    }
  }

  get isOfficialRequest(): boolean {
    return this.videoDetails.businessOwnerEmail !== '';
  }

  getGroups(restricted) {
    const result = [];
    if (restricted) {
      for (let i = 0; i < this.marketGroupsCheckboxes.length; i++) {
        if (this.marketGroupsCheckboxes[i]) {
          const marketGroup: AccessControlEntityModel = {
            id: this.marketGroups[i].id,
            name: this.marketGroups[i].name,
            type: 'Group',
            canEdit: false
          };
          result.push(marketGroup);
        }
      }
      for (let i = 0; i < this.roleGroupsCheckboxes.length; i++) {
        if (this.roleGroupsCheckboxes[i]) {
          const roleGroup: AccessControlEntityModel = {
            id: this.roleGroups[i].id,
            name: this.roleGroups[i].name,
            type: 'Group',
            canEdit: false
          };
          result.push(roleGroup);
        }
      }
    }
    return result;
  }

  setGroups() {
    for (let j = 0; j < this.videoDetails.restrictionCategories.length; j++) {
      for (let i = 0; i < this.marketGroupsCheckboxes.length; i++) {
        if (this.marketGroups[i].id === this.videoDetails.restrictionCategories[j]) {
          this.marketGroupsCheckboxes[i] = true;
        }
      }
      for (let i = 0; i < this.roleGroupsCheckboxes.length; i++) {
        if (this.roleGroups[i].id === this.videoDetails.restrictionCategories[j]) {
          this.roleGroupsCheckboxes[i] = true;
        }
      }
    }
    console.log(this.marketGroupsCheckboxes);
    console.log(this.roleGroupsCheckboxes);
  }

  createForm() {
    this.submitClicked = false;
    this.progress = 0;
    this.fileChoosen = false;
    this.fileLabel = 'Add Video';
    this.docfileLabel1 = 'Add Document';
    this.docfileLabel2 = 'Add Document';
    this.docfileLabel3 = 'Add Document';
    this.thumbnailFileLabel = 'Add Thumbnail';
    if (this.videoDetails.srtFileName == '') {
      this.srtfileLabel = 'Add .srt file';
    } else {
      this.srtfileLabel = this.videoDetails.srtFileName;
    }
    this.form = this.formBuilder.group({
      title: [this.videoDetails.title, Validators.required],
      description: [this.videoDetails.description, Validators.required],
      businessOwnerName: this.isOfficialRequest
        ? [this.videoDetails.businessOwnerName, Validators.compose([Validators.required, Validators.maxLength(150)])]
        : this.videoDetails.businessOwnerName,
      businessOwnerEmail: this.isOfficialRequest
        ? [this.videoDetails.businessOwnerEmail, Validators.compose([Validators.required, Validators.email])]
        : [this.videoDetails.businessOwnerEmail, Validators.email],
      contactsName: this.videoDetails.contactsName,
      contactsEmail: this.videoDetails.contactsEmail,
      videoFile: null,
      docFile1: null,
      docFile2: null,
      docFile3: null,
      thumbnailFile: null,
      srtFile: null,
      selected_category: 0,
      // FST-4150 - 10/5/2023 -  commenting below statement as we are no longer getting franchise details in digits it's either "Ford" or "Lincoln" or "Both".
      // franchiseCategory: this.videoDetails.franchise === 2 ? 0 : this.videoDetails.franchise + 1,
      franchiseCategory: this.videoDetails.franchise.toString() === 'Both' ? 0 : (this.videoDetails.franchise.toString() === 'Ford' ? 1:2),
      tag: [this.videoDetails.tags.join(';'), Validators.required],
      expirationDate: this.videoDetails.expirationDate,
      publishDate: this.videoDetails.publishDate,
      notes: this.videoDetails.notes,
      is360: this.videoDetails.is360,
      enableDownload: this.videoDetails.enableDownloads,
      restricted: this.videoDetails.restrictionCategories.length > 0
    });
    console.log(this.form.value);
  }

  isPublishDateValid() {
    return this.form.value.publishDate != null;
  }

  isTagValid() {
    return (
      this.form.value.tag.split(';').filter(function (el) {
        return el !== '';
      }).length >= 3
    );
  }

  isValid() {
    return this.isPublishDateValid() && this.isTagValid() && this.isContactEmailsValid() && !this.loading && this.form.valid && this.videoFileSizeErrorMessage === "";
  }

  isContactEmailsValid() {
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return (
      this.form.value.contactsEmail.split(';').filter(function (el) {
        return el !== '' && !regexp.test(el.trim());
      }).length === 0
    );
  }

  get showAdminItems(): boolean {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    return userRole === UserRoleEnum.SUPER_ADMIN;
  }

  clearFile() {
    this.form.get('videoFile').setValue(null);
    this.fileInput.nativeElement.value = '';
  }

// FST-427 - commenting this function as user won't be able to delete the supplemental files from website.
  // removeFile(ind: number) {
  //   const fileId = this.videoDetails.files[ind].id;
  //   this.dataService.removeAttachedFile(fileId).subscribe(
  //     result => {
  //       this.videoDetails.files.splice(ind, 1);
  //     },
  //     error => console.log(`Error: ${error}`)
  //   );

  //   return false;
  // }

  franchiseChanged() {
    this.categories = Object.assign([], this.categoriesByFranchise[this.form.value.franchiseCategory]);
    this.selected_categories = [];
    this.form.get('selected_category').setValue(0);
    return false;
  }

  addCategory() {
    const index = parseInt(this.form.get('selected_category').value, 10);
    this.selected_categories.unshift(this.categories[index]);
    this.categories.splice(index, 1);
    this.form.get('selected_category').setValue(0);
    return false;
  }

  removeSelectedCategory(index) {
    this.categories.push(this.selected_categories[index]);
    this.selected_categories.splice(index, 1);
    this.form.get('selected_category').setValue(0);
    return false;
  }

  getAttachmentUrl(id) {
    return environment.maApiUrl + 'api/video/attached-file/' + id;
  }

  downloadSupplementalFile(videoid, fileid, filename) {
    return environment.maApiUrl + 'api/video/' + videoid + '/downloadfile/' + fileid + '?filename=' + filename;
  }

  async edituserHasAccess() {
    const userid = getCookie('userid');
    const _result = await this.videoDetails.customFields.find((item) => item.value === userid && item.name === 'UploaderID')
    if (_result == undefined) {
      this.router.navigate(['/edit-access-denied']);
    }

  }

  ngOnInit() {
    console.log(environment.franchise);
    this.id = this.currentRoute.snapshot.queryParamMap.get('v');
    this.redirectOnAdmin = this.currentRoute.snapshot.queryParamMap.get('r');

    if (this.id === null || this.id === '') {
      this.router.navigate(['manage']);
    }

    this.franchiseCategories = this.currentRoute.snapshot.data.franchiseCategories;
    this.videoDetails = this.currentRoute.snapshot.data.videoDetailsResponse;


    if (parseInt(getCookie('userRoleId'), 10) === UserRoleEnum.SUPER_ADMIN || parseInt(getCookie('userRoleId'), 10) === UserRoleEnum.DEALER_ADMIN) {

      this.canEdit = true;

    } else {
      this.edituserHasAccess();
      this.allowedUsersForEdit = this.videoDetails.accessControlEntities.filter((item) => item.type === "User").map((item, index) => { return item.id; });

      if (this.allowedUsersForEdit) {

        this.userService.getByUserName(getCookie('userid'))
          .subscribe((response: UserModel) => {
            if (response) {
              if (this.allowedUsersForEdit.find((item) => item === response.userId)) {
                this.canEdit = true;
              }
            };
          })
      }
    }

    if (!this.canEdit) {
      console.log("You don't have permission to edit this video.");
      this.router.navigate(['/']);
    }

    this.categoriesByFranchise[environment.franchise + 1] = this.currentRoute.snapshot.data.categories;
    for (let i = 0; i < this.categoriesByFranchise[environment.franchise + 1].length; i++) {
      this.categoriesByFranchise[environment.franchise + 1][i].fullpath =
        (environment.franchise === 0 ? 'Ford/' : 'Lincoln/') + this.categoriesByFranchise[environment.franchise + 1][i].fullpath;
    }

    this.categoriesService.franchiseCategories(environment.franchise === 0 ? FranchiseType.Lincoln : FranchiseType.Ford).subscribe(
      response => {
        this.categoriesByFranchise[environment.franchise === 0 ? 2 : 1] = response;
        for (let i = 0; i < this.categoriesByFranchise[environment.franchise === 0 ? 2 : 1].length; i++) {
          this.categoriesByFranchise[environment.franchise === 0 ? 2 : 1][i].fullpath =
            (environment.franchise === 0 ? 'Lincoln/' : 'Ford/') + this.categoriesByFranchise[environment.franchise === 0 ? 2 : 1][i].fullpath;
        }
        this.categoriesByFranchise[0] = flattenDeep([this.categoriesByFranchise[1], this.categoriesByFranchise[2]]);

       // FST-4150 - 10/5/2023 -  commenting below statement as we are no longer getting franchise details in digits it's either "Ford" or "Lincoln" or "Both".
       // this.categories = Object.assign([], this.categoriesByFranchise[this.videoDetails.franchise === 2 ? 0 : this.videoDetails.franchise + 1]);

        this.categories = Object.assign([], this.categoriesByFranchise[this.videoDetails.franchise.toString() === "Both" ? 0 : (this.videoDetails.franchise.toString() === "Ford" ? 1 : 2)]);

        this.selected_categories = this.categories.filter(c1 => this.videoDetails.categoryPaths.filter(c2 => c2.categoryId === c1.categoryId).length > 0);
        this.categories = this.categories.filter(c1 => this.videoDetails.categoryPaths.filter(c2 => c2.categoryId === c1.categoryId).length === 0);

        console.log(this.categoriesByFranchise);
      },
      error => console.log('Error: ', error)
    );

    console.log(this.videoDetails);

    this.marketGroups = this.currentRoute.snapshot.data.marketGroups;
    this.marketGroupsCheckboxes = new Array<boolean>(this.marketGroups.length);
    this.marketGroupsCheckboxes.fill(false);
    this.roleGroups = this.currentRoute.snapshot.data.roleGroups;
    this.roleGroupsCheckboxes = new Array<boolean>(this.roleGroups.length);
    this.roleGroupsCheckboxes.fill(false);
    console.log(this.marketGroups);
    console.log(this.roleGroups);
    console.log(this.videoDetails);
    this.createForm();
    this.setGroups();
  }

  ngOnDestroy() {
    if (this.progressInterval != null) {
      clearInterval(this.progressInterval);
    }
  }

  onChange(event): void {
    this._boolexpiration = false;
  }

  ngAfterViewInit() {
    //this.form.patchValue({
    //  makeOfficial: true
    //});

  }
}
