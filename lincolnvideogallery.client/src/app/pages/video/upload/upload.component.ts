import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { UploadVideoModel } from '../../../domain/interfaces/uploadvideo.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VideoService } from '../../../domain/services/video.service';
import { ActivatedRoute } from '@angular/router';
import { VideoAccessControlType } from '../../../domain/enums/videoaccesscontroltype.enum';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserGroupModel } from '../../../domain/interfaces/usergroup.interface';
import { CategoryModel } from '../../../domain/interfaces/category.interface';
import { flattenDeep } from 'lodash';
import { FranchiseType } from '../../../domain/enums/franchisetype.enum';
import { CategoriesService } from '../../../domain/services/categories.service';
import { AccessControlEntityModel } from '../../../domain/interfaces/accesscontrolentity.interface';
import { UserTypeEnum } from '../../../domain/enums/usertype.enum';
import { XapiService } from '../../../domain/services/xapi.service';
import { removeEmptyProperties } from '../../../common/utilities/object-utilities';
import { VerbId } from 'src/app/core/xapi/enums/verb-id.enum';
import { Statement, Grouping } from '../../../core/xapi/models/xapi.interface';
import { DefinitionType } from '../../../core/xapi/enums/definition-type.enum';
import { FileSizePipe } from '../../../common/pipes/file-size/file-size.pipe';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { UserService } from 'src/app/core/user/user.service';
import { IUser } from 'src/app/core/user/user';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  dragFocus: boolean;
  loading = false;
  loaded: boolean;
  fileChoosen = false;
  filesMessage = '';
  private _videoFileSizeErrorMessage = '';
  public get videoFileSizeErrorMessage() {
    return this._videoFileSizeErrorMessage;
  }
  public set videoFileSizeErrorMessage(value) {
    this._videoFileSizeErrorMessage = value;
  }
  showFileAlert = false;
  srtMessage = '';
  showSrtAlert = false;
  allowedExtensions = ['pptx', 'docx', 'pdf', 'xlsx', 'doc', 'ppt', 'xls'];
  fileLabel = 'Add Video';
  docfileLabel1 = 'Add Document';
  docfileLabel2 = 'Add Document';
  docfileLabel3 = 'Add Document';
  srtfileLabel = 'Add .srt file';
  progress = 0;
  progressInterval: any;
  progressLabel = "Uploading..";
  progressStep: number;
  pageStartTime = new Date();
  selected_categories: CategoryModel[] = [];
  marketGroups: UserGroupModel[];
  marketGroupsCheckboxes: boolean[];
  roleGroups: UserGroupModel[];
  roleGroupsCheckboxes: boolean[];
  categories: CategoryModel[] = [];
  franchiseCategories: CategoryModel[];
  categoriesByFranchise: CategoryModel[][] = [];
  videoId = '';
  submitClicked = false;
  @ViewChild('fileInput', { static: false })
  fileInput: ElementRef;
  @ViewChild('docFile1', { static: false })
  doc1Input: ElementRef;
  @ViewChild('docFile2', { static: false })
  doc2Input: ElementRef;
  @ViewChild('docFile3', { static: false })
  doc3Input: ElementRef;
  @ViewChild('srtFile', { static: false })
  srtInput: ElementRef;
  _boolexpiration = false;

  constructor(
    private formBuilder: FormBuilder,
    private videoService: VideoService,
    private currentRoute: ActivatedRoute,
    private http: HttpClient,
    private categoriesService: CategoriesService,
    private fileSizePipe: FileSizePipe,
    private xapiService: XapiService,
    private userService: UserService,
    public datepipe: DatePipe
  ) {
    this.loaded = false;
    this.dragFocus = false;
    this.marketGroups = [];
    this.marketGroupsCheckboxes = [];
    this.roleGroups = [];
    this.roleGroupsCheckboxes = [];
    this.franchiseCategories = [];
    this.progressStep = 0;
    this.createForm();
  }

  removeDocument(index: number) {
    if (index === 1) {
      this.doc1Input.nativeElement.value = '';
      this.docfileLabel1 = 'Add Document';
    } else if (index === 2) {
      this.doc2Input.nativeElement.value = '';
      this.docfileLabel2 = 'Add Document';
    } else {
      this.doc3Input.nativeElement.value = '';
      this.docfileLabel3 = 'Add Document';
    }
  }

  removeSrtFile() {
    this.srtInput.nativeElement.value = '';
    this.srtfileLabel = 'Add .srt file';
  }

  checkFileSize(files: FileList): boolean {
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalSize += file.size;
    }
    if (totalSize <= 2147483648) {
      this.videoFileSizeErrorMessage = "";
      return true;
    }
    this.videoFileSizeErrorMessage = "The file size limit is 2GB";
    return false;
  }

  upload(files: FileList) {
    if (files.length === 0) {
      return;
    }
    this.fileLabel = files[0].name;
    this.fileChoosen = true;
    this.form.get('videoFile').setValue(files[0]);
  }

  uploadSrt(files: any[]) {
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

  uploadFile(files: any[], index: number) {
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
      if (index === 1) {
        this.doc1Input.nativeElement.value = '';
        this.docfileLabel1 = 'Add Document';
      } else if (index === 2) {
        this.doc2Input.nativeElement.value = '';
        this.docfileLabel2 = 'Add Document';
      } else {
        this.doc3Input.nativeElement.value = '';
        this.docfileLabel3 = 'Add Document';
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

  checkExtension(fileName: string): boolean {
    const extension = fileName.split('.').pop();
    return this.allowedExtensions.filter(ex => ex === extension).length === 0;
  }

  franchiseChanged() {
    this.categories = Object.assign([], this.categoriesByFranchise[this.form.get('franchiseCategory').value]);
    this.selected_categories = [];
    this.form.get('selected_category').setValue(0);
  }

  changeRole(ind: number) {
    this.roleGroupsCheckboxes[ind] = !this.roleGroupsCheckboxes[ind];
  }

  addCategory() {
    const index = parseInt(this.form.get('selected_category').value, 10);
    this.selected_categories.unshift(this.categories[index]);
    this.categories.splice(index, 1);
    this.form.get('selected_category').setValue(0);
  }

  removeSelectedCategory(index: number) {
    this.categories.push(this.selected_categories[index]);
    this.selected_categories.splice(index, 1);
    this.form.get('selected_category').setValue(0);
  }

  isTagValid() {
    return (
      this.form.value.tag.split(';').filter((el: string) => el !== '').length >= 3
    );
  }

  submitDealerVideo(formModel: { title: any; description: any; placeholder: any; videoFile: string | Blob; tag: string; expirationDate: Date | undefined; }) {
    const userName = this.userService.getUserName() || '';
    const data: UploadVideoModel = {
      enableDownloads: false,
      title: formModel.title,
      description: formModel.description,
      fileName: formModel.placeholder ? '' : (typeof formModel.videoFile === 'string' ? formModel.videoFile : formModel.title),
      data: [],
      tags: formModel.tag.split(';').filter((el: string) => el !== ''),
      expirationDate: formModel.expirationDate ? formModel.expirationDate : this.defaultExpirationDate(),
      uploader: userName,
      categories: [],
      franchiseCategories: [],
      videoAccessControl: VideoAccessControlType.AllUsers,
      accessControlEntities: [],
      placeholder: formModel.placeholder,
      businessOwnerName: '',
      businessOwnerEmail: '',
      contactsName: '',
      contactsEmail: '',
      partOfSeries: false,
      notes: '',
      is360: false,
      srtFileName: ''
    };

    const formData = new FormData();
    formData.append('model', JSON.stringify(data));
    if (!formModel.placeholder) {
      formData.append('file', formModel.videoFile);
    }

    return new HttpRequest('POST', `${environment.maApiUrl}api/Video/dealer-upload2`, formData, {
      reportProgress: true
    });
  }

  changeMarket(ind: number) {
    this.marketGroupsCheckboxes[ind] = !this.marketGroupsCheckboxes[ind];
  }

  get isEmployee(): boolean {
    const userType = this.userService.getUserTypeId();
    return userType === UserTypeEnum.Nonovvm || userType === UserTypeEnum.Supplier || userType === UserTypeEnum.Other;
  }

  defaultExpirationDate(): Date {
    const userType = this.userService.getUserTypeId();
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    return new Date(year + 1, month, day);
  }

  submitVideoRequest(formModel: { expirationDate: Date | undefined; publishDate: any; enableDownloads: any; title: any; description: any; placeholder: any; videoFile: string | Blob, tag: string; franchiseCategory: any; restricted: any; businessOwnerName: any; businessOwnerEmail: any; contactsName: any; contactsEmail: any; part: any; notes: any; is360: any; docFile1: string | Blob | null; docFile2: string | Blob | null; docFile3: string | Blob | null; srtFile: string | Blob | null; }) {
    const userName = this.userService.getUserName() || '';
    const model: UploadVideoModel = {
      expirationDate: formModel.expirationDate ? formModel.expirationDate : this.defaultExpirationDate(),
      publishDate: formModel.publishDate,
      enableDownloads: formModel.enableDownloads,
      title: formModel.title,
      description: formModel.description,
      fileName: formModel.placeholder ? '' : (typeof formModel.videoFile === 'string' ? formModel.videoFile : formModel.title),
      data: [],
      tags: formModel.tag.split(';').filter((el: string) => el !== ''),
      uploader: userName,
      categories: this.selected_categories.map(c => c.categoryId),
      franchiseCategories: this.getFranchiseIds(formModel.franchiseCategory || []),
      videoAccessControl: formModel.restricted ? VideoAccessControlType.Private : VideoAccessControlType.AllUsers,
      accessControlEntities: this.getGroups(formModel.restricted),
      placeholder: formModel.placeholder,
      businessOwnerName: formModel.businessOwnerName,
      businessOwnerEmail: formModel.businessOwnerEmail,
      contactsName: formModel.contactsName,
      contactsEmail: formModel.contactsEmail,
      partOfSeries: formModel.part,
      notes: formModel.notes,
      is360: !formModel.placeholder && formModel.is360,
      srtFileName: ''
    };

    const formData = new FormData();
    formData.append('model', JSON.stringify(model));
    if (!formModel.placeholder) {
      formData.append('file', formModel.videoFile);
    }
    if (formModel.docFile1 != null) {
      formData.append('doc1', formModel.docFile1);
    }
    if (formModel.docFile2 != null) {
      formData.append('doc2', formModel.docFile2);
    }
    if (formModel.docFile3 != null) {
      formData.append('doc3', formModel.docFile3);
    }
    if (formModel.srtFile != null) {
      formData.append('srt', formModel.srtFile);
    }

    return new HttpRequest('POST', `${environment.maApiUrl}api/Video/upload-request`, formData, {
      reportProgress: true
    });
  }

  isExpirationDateDisabled(date: { year: number; month: number; day: number | undefined; }) {
    const publishDatePicker = document.getElementById('publishDatePicker') as HTMLInputElement;
    if (publishDatePicker && publishDatePicker.value) {
      let pubDate = new Date(publishDatePicker.value + "T00:00:00");
      let expirationDate = new Date(pubDate);
      const d = pubDate;
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      expirationDate = new Date(year + 1, month, day);

      const d2 = new Date(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate());
      const d3 = new Date(date.year, date.month - 1, date.day);
      return d3 > d2 || pubDate > d3;
    } else {
      const d = new Date(date.year, date.month - 1, date.day ? date.day + 1 : 1);
      const d2 = new Date(date.year - 1, date.month - 1, date.day ? date.day : 1);
      return d2 > new Date() || d <= new Date();
    }
  }

  isPublishDateDisabled(date: { year: number; month: number; day: number | undefined; }) {
    const d = new Date(date.year, date.month - 1, date.day ? date.day + 1 : 1);
    const d2 = new Date(date.year - 2, date.month - 1, date.day ? date.day : 1);
    return d2 > new Date() || d < new Date();
  }

  getFranchiseIds(id: any) {
    switch (id) {
      case 0:
        return [this.franchiseCategories[1].categoryId, this.franchiseCategories[2].categoryId];
      case 1:
        return [this.franchiseCategories[1].categoryId];
      case 2:
        return [this.franchiseCategories[2].categoryId];
      default:
        return [];
    }
  }

  makeOfficialChanged() {
    if (this.form.get('makeOfficial').value) {
      this.form.get('businessOwnerName').setValidators([Validators.required, Validators.maxLength(150)]);
      this.form.get('businessOwnerEmail').setValidators([Validators.required, Validators.email]);
      this.form.get('publishDate').setValidators([Validators.required]);
    } else {
      this.form.get('businessOwnerName').setValidators([]);
      this.form.get('businessOwnerEmail').setValidators([Validators.email]);
      this.form.get('publishDate').setValidators([]);
    }
    this.form.get('businessOwnerName').updateValueAndValidity();
    this.form.get('businessOwnerEmail').updateValueAndValidity();
    this.form.get('publishDate').updateValueAndValidity();
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
      const d = new Date(pubDate);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      this.form.patchValue({
        expirationDate: this.datepipe.transform(new Date(year + 1, month, day), 'yyyy-MM-dd')
      });
    } else {
      let publishDate = this.form.get('publishDate').value;
      if (publishDate.length <= 10) {
        publishDate = this.formatISODate(publishDate) + "T00:00:00";
      }
      const d = new Date(publishDate);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      const eDate = new Date(year + 1, month, day);
      let expirationDate = this.form.get('expirationDate').value;
      if (expirationDate.length <= 10) {
        expirationDate = this.formatISODate(expirationDate) + "T00:00:00";
      }
      const expDate = new Date(expirationDate);
      const pubDate = new Date(publishDate);
      if ((expDate >= pubDate) && (expDate <= eDate)) {
        this._boolexpiration = false;
      } else {
        this._boolexpiration = true;
        return false;
      }
    }

    this.submitClicked = true;
    console.log('onSubmit called');
    this.loaded = false;
    if (this.isValid()) {
      const formModel = this.form.value;
      this.loading = true;

      const uploadReq = formModel.makeOfficial ? this.submitVideoRequest(formModel) : this.submitDealerVideo(formModel);

      const startTime: any = new Date();
      this.http.request(uploadReq).subscribe(event => {
        const time = new Date();
        if (event.type === HttpEventType.UploadProgress) {
          console.log('Progress  ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ':' + time.getMilliseconds());
          console.log(event);
          this.progress = Math.round((50 * event.loaded) / (event.total || 1));
          this.progressLabel = `Uploaded ${this.progress}% (${this.fileSizePipe.transform(event.loaded)} from ${this.fileSizePipe.transform(event.total)})`;
          if (event.loaded === event.total) {
            const finishTime: any = new Date();
            const diff = finishTime - startTime;
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
          this.uploadingFinished(formModel.makeOfficial ? true : event);

          const categories: Grouping[] = [];
          this.selected_categories.forEach((value: CategoryModel) => {
            categories.push({
              id: 'https://forddealersrev.dealerconnection.com/#/media/videos/category/' + value.categoryId,
              definition: {
                name: {
                  'en-US': value.name
                },
                type: DefinitionType.CATEGORY
              },
              objectType: 'Activity'
            });
          });

          const user = this.userService.getUser() || { id: '', firstName: '', lastName: '', userTypeId: '', userName: '' };
          const homePage = this.userService.getUserTypeId() === UserTypeEnum.Employee
            ? 'https://www.wslb2b.ford.com'
            : 'https://wslx.dealerconnection.com';
          let payload: Statement = {
            actor: {
              name: `${user.firstName} ${user.lastName}`,
              objectType: 'Agent',
              account: {
                homePage,
                name: user.userName.toString()
              }
            },
            verb: {
              id: VerbId.SUBMIT,
              display: {
                'en-US': 'Video Uploaded'
              }
            },
            context: {
              contextActivities: {
                grouping: [
                  {
                    id: window.location.origin,
                    definition: {
                      name: {
                        'en-US': environment.franchise === 0 ? 'Ford Tube' : 'Lincoln Video Gallery'
                      },
                      type: DefinitionType.ORGANIZATION
                    },
                    objectType: 'Activity'
                  },
                  ...categories
                ],
                other: [
                  {
                    id: this.userService.getStarsId() ? 'https://xapi.ford.com/extension/starsFlag' : '',
                    objectType: this.userService.getStarsId() ? 'Activity' : ''
                  }
                ]
              },
              extensions: {
                'https://xapi.ford.com/extension/courseid': '',
                'https://xapi.ford.com/extension/starsid': this.userService.getStarsId()
              }
            },
            object: {
              id: 'https://xapi.ford.com/activities/' + (environment.franchise === 0 ? 'fordtube' : 'lincolnvideogallery') + '/upload/' + this.videoId,
              objectType: 'Activity',
              definition: {
                name: {
                  'en-US': formModel.title
                },
                type: DefinitionType.VIDEO,
                description: {
                  'en-US': formModel.description
                },
                moreInfo: window.location.href
              }
            }
          };

          payload = removeEmptyProperties(payload);
          this.xapiService.statements(payload).subscribe();
        }
      });
    } else {
      this.scrollToError();
    }
    return false;
  }

  scrollToError() {
    console.log('scroll called');
    if (!this.fileChoosen && !this.form.value.placeholder) {
      console.log('scroll to video');
      document.getElementById('video').scrollIntoView(false);
      return;
    }
    if (this.form.get('makeOfficial').value && !this.form.get('businessOwnerName').valid) {
      document.getElementById('businessOwnerName').scrollIntoView(false);
      return;
    }
    if (this.form.get('makeOfficial').value && !this.form.get('businessOwnerEmail').valid) {
      document.getElementById('contactsEmail').scrollIntoView(false);
      return;
    }
    if (this.form.get('makeOfficial').value && !this.isContactEmailsValid()) {
      console.log('scroll to contacts');
      document.getElementById('title-field').scrollIntoView(false);
      return;
    }
    if (!this.form.get('title').valid) {
      console.log('scroll to title');
      document.getElementById('description-field').scrollIntoView(false);
      return;
    }
    if (!this.form.get('description').valid) {
      console.log('scroll to description');
      document.getElementById('tag').scrollIntoView(false);
      return;
    }
    if (!this.isTagValid()) {
      console.log('scroll to tag');
      document.getElementById('terms-review').scrollIntoView(false);
      return;
    }
    if (this.form.get('makeOfficial').value && !this.form.get('publishDate').valid) {
      document.getElementById('downloadCheckbox').scrollIntoView(false);
      return;
    }
    if (!this.form.get('termsReviewed').value) {
      console.log('scroll to terms');
      document.getElementById('terms-review').scrollIntoView(false);
      return;
    }
  }

  uploadingFinished(result: boolean | HttpResponse<unknown> | null) {
    this.videoId = '';
    this.loading = false;
    if (result != null) {
      if ((result as any).body && (result as any).body.videoId) {
        this.videoId = (result as any).body.videoId;
        console.log(this.videoId);
      }
      this.loaded = true;
      window.scroll(0, 0);
      this.clearFile();
      this.createForm();
    }
  }

  createForm() {
    this.submitClicked = false;
    this.fileLabel = 'Add Video';
    this.docfileLabel1 = 'Add Document';
    this.docfileLabel2 = 'Add Document';
    this.docfileLabel3 = 'Add Document';
    this.srtfileLabel = 'Add .srt file';
    this.progressLabel = 'File is uploading...';
    this.selected_categories = [];
    this.marketGroupsCheckboxes.fill(false);
    this.roleGroupsCheckboxes.fill(false);
    this.progress = 0;
    this.fileChoosen = false;
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(250)])],
      businessOwnerName: '',
      businessOwnerEmail: ['', Validators.email],
      contactsName: '',
      contactsEmail: '',
      videoFile: null,
      docFile1: null,
      docFile2: null,
      docFile3: null,
      srtFile: null,
      makeOfficial: true,
      selected_category: 0,
      termsReviewed: false,
      franchiseCategory: environment.franchise + 1,
      tag: ['', Validators.required],
      restricted: false,
      enableDownloads: false,
      expirationDate: null,
      publishDate: new Date(),
      placeholder: false,
      part: false,
      notes: '',
      is360: false
    });
  }

  isValid() {
    return (
      this.isTagValid() && this.isContactEmailsValid() && !this.loading && this.form.valid && this.form.get('termsReviewed').value && (this.fileChoosen || this.form.get('placeholder').value) && this.videoFileSizeErrorMessage === ""
    );
  }

  isContactEmailsValid() {
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return (
      this.form.value.contactsEmail.split(';').filter((el: string) => el !== '' && !regexp.test(el.trim())).length === 0
    );
  }

  clearFile() {
    if (this.fileInput) {
      if (this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    }
    if (this.doc1Input) {
      if (this.doc1Input.nativeElement) {
        this.doc1Input.nativeElement.value = '';
      }
    }
    if (this.doc2Input) {
      if (this.doc2Input.nativeElement) {
        this.doc2Input.nativeElement.value = '';
      }
    }
    if (this.doc3Input) {
      if (this.doc3Input.nativeElement) {
        this.doc3Input.nativeElement.value = '';
      }
    }
  }

  getGroups(restricted: any) {
    const result: AccessControlEntityModel[] = [];
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

  ngOnInit() {
    this.categoriesByFranchise[environment.franchise + 1] = this.currentRoute.snapshot.data['categories'] || [];
    for (let i = 0; i < this.categoriesByFranchise[environment.franchise + 1].length; i++) {
      this.categoriesByFranchise[environment.franchise + 1][i].fullpath =
        (environment.franchise === 0 ? 'Ford/' : 'Lincoln/') + this.categoriesByFranchise[environment.franchise + 1][i].fullpath;
    }
    this.categories = Object.assign([], this.categoriesByFranchise[environment.franchise + 1]);
    this.categoriesService.franchiseCategories(environment.franchise === 0 ? FranchiseType.Lincoln : FranchiseType.Ford).subscribe(
      response => {
        for (let i = 0; i < response.length; i++) {
          response[i].fullpath = (environment.franchise === 0 ? 'Lincoln/' : 'Ford/') + response[i].fullpath;
        }
        this.categoriesByFranchise[environment.franchise === 0 ? 2 : 1] = response;
        this.categoriesByFranchise[0] = flattenDeep([this.categoriesByFranchise[1], this.categoriesByFranchise[2]]);
        console.log(this.categoriesByFranchise);
      },
      error => console.log('Error: ', error)
    );

    this.franchiseCategories = this.currentRoute.snapshot.data['franchiseCategories'] || [];
    this.marketGroups = this.currentRoute.snapshot.data['marketGroups'] || [];
    this.marketGroupsCheckboxes = new Array<boolean>(this.marketGroups.length).fill(false);
    this.roleGroups = this.currentRoute.snapshot.data['roleGroups'] || [];
    this.roleGroupsCheckboxes = new Array<boolean>(this.roleGroups.length).fill(false);
    this.createForm();
  }

  ngOnDestroy() {
    if (this.progressInterval != null) {
      clearInterval(this.progressInterval);
    }
  }

  onChange(event: any): void {
    this._boolexpiration = false;
  }

  ngAfterViewInit() {
    this.form.patchValue({
      makeOfficial: true
    });
  }
}
