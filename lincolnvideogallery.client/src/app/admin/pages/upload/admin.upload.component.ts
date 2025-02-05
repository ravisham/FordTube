import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { UploadVideoModel } from '../../../domain/interfaces/uploadvideo.interface';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryModel } from '../../../domain/interfaces/category.interface';
import { CategoriesService } from '../../../domain/services/categories.service';
import { ActivatedRoute } from '@angular/router';
import { UserGroupModel } from '../../../domain/interfaces/usergroup.interface';
import { VideoAccessControlType } from '../../../domain/enums/videoaccesscontroltype.enum';
import { AccessControlEntityModel } from '../../../domain/interfaces/accesscontrolentity.interface';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { FranchiseType } from '../../../domain/enums/franchisetype.enum';
import { flattenDeep } from 'lodash';
import { XapiService } from '../../../domain/services/xapi.service';
import { Statement, Grouping } from '../../../core/xapi/models/xapi.interface';
import { DefinitionType } from 'src/app/core/xapi/enums/definition-type.enum';
import { VerbId } from '../../../core/xapi/enums/verb-id.enum';
import { removeEmptyProperties } from '../../../common/utilities/object-utilities';
import { DatePipe } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core/user/user.service';
import { IUser } from 'src/app/core/user/user';

@Component({
  selector: 'app-admin-upload',
  templateUrl: './admin.upload.component.html',
  styleUrls: ['./admin.upload.component.scss'],
})
export class AdminUploadComponent implements OnInit, OnDestroy, AfterViewInit {
  form = this.formBuilder.group({
    title: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
    description: ['', Validators.compose([Validators.required, Validators.maxLength(250)])],
    videoFile: [null],
    docFile1: [null],
    docFile2: [null],
    docFile3: [null],
    srtFile: [null],
    selected_category: [0],
    franchiseCategory: [environment.franchise + 1],
    tag: ['', Validators.compose([Validators.required])], // REQUIRED
    restricted: [false],
    enableDownloads: [false],
    expirationDate: [null],
    publishDate: [null],
    placeholder: [false],
    is360: [false],
  });
  loading = false;
  loaded = false;
  categories: CategoryModel[] = [];
  franchiseCategories: CategoryModel[] = []; // Initialize 'franchiseCategories' property
  selected_categories: CategoryModel[] = [];
  marketGroups: UserGroupModel[] = []; // Initialize 'marketGroups' property
  marketGroupsCheckboxes: boolean[] = []; // Initialize 'marketGroupsCheckboxes' property
  roleGroups: UserGroupModel[] = []; // Initialize 'roleGroups' property
  roleGroupsCheckboxes: boolean[] = []; // Initialize 'roleGroupsCheckboxes' property
  currentMenuItem = AdminMenuItems.Upload;
  fileChoosen = false;
  pageStartTime = new Date();
  progress = 0;
  filesCount = 0;
  categoriesByFranchise: CategoryModel[][] = [];
  srtMessage = '';
  showSrtAlert = false;
  filesMessage = '';
  showFileAlert = false;
  allowedExtensions = ['pptx', 'docx', 'pdf', 'xlsx', 'doc', 'ppt', 'xls'];
  progressInterval: any = null;
  progressLabel = 'File is uploading...';
  progressStep = 0;
  fileLabel = 'Add Video';
  docfileLabel1 = 'Add Document';
  docfileLabel2 = 'Add Document';
  docfileLabel3 = 'Add Document';
  srtfileLabel = 'Add .srt file';
  videoId = '';

  @ViewChild('docFile1', { static: false }) doc1Input: ElementRef;
  @ViewChild('docFile2', { static: false }) doc2Input: ElementRef;
  @ViewChild('docFile3', { static: false }) doc3Input: ElementRef;
  @ViewChild('srtFile', { static: false }) srtInput: ElementRef;
  _boolexpiration = false;

  constructor(
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private currentRoute: ActivatedRoute,
    private http: HttpClient,
    private xapiService: XapiService,
    private userService: UserService, // Add UserService
    public datepipe: DatePipe
  ) {}

  upload(files: FileList) {
    if (files.length === 0) {
      return;
    }
    this.fileLabel = files[0].name;
    this.fileChoosen = true;
    this.form.get('videoFile').setValue(files[0]);
  }

  isExpirationDateDisabled(date: NgbDateStruct): boolean {
    const publishDateValue = (document.getElementById('publishDatePicker') as HTMLInputElement).value;
    if (publishDateValue) {
      const pubDate = new Date(`${publishDateValue}T00:00:00`);
      const expirationDate = new Date(pubDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      const selectedDate = new Date(date.year, date.month - 1, date.day);
      return selectedDate > expirationDate || pubDate > selectedDate;
    } else {
      const selectedDate = new Date(date.year, date.month - 1, date.day + 1);
      const oneYearAgo = new Date(date.year - 1, date.month - 1, date.day);
      return oneYearAgo > new Date() || selectedDate <= new Date();
    }
  }

  isPublishDateDisabled(date: NgbDateStruct): boolean {
    const selectedDate = new Date(date.year, date.month - 1, date.day + 1);
    const twoYearsAgo = new Date(date.year - 2, date.month - 1, date.day);
    return twoYearsAgo > new Date() || selectedDate < new Date();
  }

  uploadSrt(files: FileList) {
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

  removeStrFile() {
    this.srtInput.nativeElement.value = '';
    this.srtfileLabel = 'Add .srt file';
    return;
  }

  uploadFile(files: FileList, index: number) {
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
    return this.allowedExtensions.filter((ex) => ex === extension).length === 0;
  }

  changeMarket(ind: number) {
    this.marketGroupsCheckboxes[ind] = !this.marketGroupsCheckboxes[ind];
  }

  changeRole(ind: number) {
    this.roleGroupsCheckboxes[ind] = !this.roleGroupsCheckboxes[ind];
  }

  franchiseChanged() {
    this.categories = [...this.categoriesByFranchise[this.form.value.franchiseCategory]];
    this.selected_categories = [];
    this.form.get('selected_category').setValue(0);
    return false;
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
        expirationDate: this.datepipe.transform(new Date(year + 1, month, day), 'yyyy-MM-dd'),
      });
    } else {
      let publishDate = this.form.get('publishDate').value;
      if (publishDate.length <= 10) {
        publishDate = this.formatISODate(publishDate) + "T00:00:00";
      }
      let d = new Date(publishDate);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      const _eDate = new Date(year + 1, month, day);
      let expirationDate = this.form.get('expirationDate').value;
      if (expirationDate.length <= 10) {
        expirationDate = this.formatISODate(expirationDate) + "T00:00:00";
      }
      const expDate: Date = new Date(expirationDate);
      const pubDate: Date = new Date(publishDate);
      if (expDate >= pubDate && expDate <= _eDate) {
        this._boolexpiration = false;
      } else {
        this._boolexpiration = true;
        return false;
      }
    }
    if (this.isValid()) {
      const formModel = this.form.value;
      this.loading = true;
      this.userService.user$.subscribe((user) => {
        const model: UploadVideoModel = {
          expirationDate: formModel.expirationDate,
          publishDate: formModel.publishDate,
          enableDownloads: formModel.enableDownloads,
          title: formModel.title,
          description: formModel.description,
          fileName: formModel.placeholder ? '' : formModel.videoFile ? formModel.videoFile.name : '',
          data: [],
          tags: formModel.tag.split(';').filter((el: string) => el !== ''),
          uploader: user ? user.userName : '',
          categories: this.selected_categories.map((c) => c.categoryId),
          franchiseCategories: this.getFranchiseIds(formModel.franchiseCategory) || [],
          videoAccessControl: formModel.restricted
            ? VideoAccessControlType.Private
            : VideoAccessControlType.AllUsers,
          accessControlEntities: this.getGroups(formModel.restricted),
          placeholder: formModel.placeholder,
          businessOwnerName: '',
          businessOwnerEmail: '',
          contactsName: '',
          contactsEmail: '',
          partOfSeries: false,
          notes: '',
          is360: !formModel.placeholder && formModel.is360,
          srtFileName: '',
        };

        const formData = new FormData();
        formData.append('model', JSON.stringify(model));
        if (!formModel.placeholder && formModel.videoFile) {
          formData.append('file', formModel.videoFile);
        }
        if (formModel.docFile1) {
          formData.append('doc1', formModel.docFile1);
        }
        if (formModel.docFile2) {
          formData.append('doc2', formModel.docFile2);
        }
        if (formModel.docFile3) {
          formData.append('doc3', formModel.docFile3);
        }
        if (formModel.srtFile) {
          formData.append('srt', formModel.srtFile);
        }

        const uploadReq = new HttpRequest(
          'POST',
          `${environment.maApiUrl}api/Video/upload2`,
          formData,
          {
            reportProgress: true,
          }
        );

        const startTime: any = new Date();
        this.http.request(uploadReq).subscribe((event) => {
          const time = new Date();
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              this.progress = Math.round((50 * event.loaded) / event.total);
              this.progressLabel = `Uploaded ${this.progress}% (${event.loaded} from ${event.total} bytes)`;
            }
            if (event.loaded === event.total) {
              const finishTime: any = new Date();
              const diff: number = finishTime - startTime;
              this.progressStep = 10000 / diff;
              this.progressLabel =
                'File has been uploaded. Waiting for response from VBrick...';
              this.progressInterval = setInterval(() => {
                this.progress += Math.min(
                  this.progressStep,
                  100 - this.progress
                );
                if (this.progress >= 100) {
                  if (this.progressInterval != null) {
                    clearInterval(this.progressInterval);
                    this.progressInterval = null;
                  }
                }
              }, 200);
            }
          } else if (event.type === HttpEventType.Response) {
            if (this.progressInterval != null) {
              clearInterval(this.progressInterval);
              this.progressInterval = null;
            }
            this.uploadingFinished(event);

            const categories: Grouping[] = [];
            this.selected_categories.forEach((value: CategoryModel) => {
              categories.push({
                id:
                  'https://forddealersrev.dealerconnection.com/#/media/videos/category/' +
                  value.categoryId,
                definition: {
                  name: { 'en-US': value.name },
                  type: DefinitionType.CATEGORY,
                },
                objectType: 'Activity',
              });
            });

            let payload: Statement = {
              actor: {
                name: user ? user.firstName + ' ' + user.lastName : '',
                objectType: 'Agent',
                account: {
                  homePage:
                    user && user.userType && user.userType.name.toLocaleLowerCase() === 'employee'
                      ? 'https://www.wslb2b.ford.com'
                      : 'https://wslx.dealerconnection.com',
                  name: user ? user.userName : '',
                },
              },
              verb: {
                id: VerbId.SUBMIT,
                display: { 'en-US': 'Video Uploaded' },
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
                      id:
                        user && user.starsId
                          ? 'https://xapi.ford.com/extension/starsFlag'
                          : '',
                      objectType: user && user.starsId ? 'Activity' : '',
                    },
                  ],
                },
                extensions: {
                  'https://xapi.ford.com/extension/courseid': '',
                  'https://xapi.ford.com/extension/starsid': user ? user.starsId : '',
                },
              },
              object: {
                id:
                  'https://xapi.ford.com/activities/' +
                  (environment.franchise === 0
                    ? 'fordtube'
                    : 'lincolnvideogallery') +
                  '/upload/' +
                  this.videoId,
                objectType: 'Activity',
                definition: {
                  name: { 'en-US': formModel.title },
                  type: DefinitionType.VIDEO,
                  description: { 'en-US': formModel.description },
                  moreInfo: window.location.href,
                },
              },
            };

            payload = removeEmptyProperties(payload);
            this.xapiService.statements(payload).subscribe();
          }
        });
      });
    }
    return false;
  }

  getFranchiseIds(id: number): string[] {
    switch (id) {
      case 0:
        return [
          this.franchiseCategories[1].categoryId,
          this.franchiseCategories[2].categoryId,
        ];
      case 1:
        return [this.franchiseCategories[1].categoryId];
      case 2:
        return [this.franchiseCategories[2].categoryId];
      default:
        return [];
    }
  }

  uploadingFinished(result: HttpResponse<any>) {
    this.videoId = '';
    this.loading = false;
    if (result != null && result.body && result.body.videoId) {
      this.videoId = result.body.videoId;
    }
    this.loaded = true;
    this.createForm();
  }

  getGroups(restricted: boolean): AccessControlEntityModel[] {
    const result: AccessControlEntityModel[] = [];
    if (restricted) {
      this.marketGroupsCheckboxes.forEach((checked, i) => {
        if (checked) {
          const marketGroup: AccessControlEntityModel = {
            id: this.marketGroups[i].id,
            name: this.marketGroups[i].name,
            type: 'Group',
            canEdit: false,
          };
          result.push(marketGroup);
        }
      });
      this.roleGroupsCheckboxes.forEach((checked, i) => {
        if (checked) {
          const roleGroup: AccessControlEntityModel = {
            id: this.roleGroups[i].id,
            name: this.roleGroups[i].name,
            type: 'Group',
            canEdit: false,
          };
          result.push(roleGroup);
        }
      });
    }
    return result;
  }

  createForm() {
    this.fileLabel = 'Add Video';
    this.docfileLabel1 = 'Add Document';
    this.docfileLabel2 = 'Add Document';
    this.docfileLabel3 = 'Add Document';
    this.progressLabel = 'File is uploading...';
    this.srtfileLabel = 'Add .srt file';
    this.selected_categories = [];
    this.marketGroupsCheckboxes.fill(false);
    this.roleGroupsCheckboxes.fill(false);
    this.progress = 0;
    this.fileChoosen = false;
  }

  addCategory() {
    const index = parseInt(this.form.get('selected_category').value, 10);
    this.selected_categories.unshift(this.categories[index]);
    this.categories.splice(index, 1);
    this.form.get('selected_category').setValue(0);
    return false;
  }

  removeSelectedCategory(index: number) {
    this.categories.push(this.selected_categories[index]);
    this.selected_categories.splice(index, 1);
    this.form.get('selected_category').setValue(0);
    return false;
  }

  isValid() {
    return (
      !this.loading &&
      this.form.valid &&
      (this.fileChoosen || this.form.value.placeholder)
    );
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
    return;
  }

  ngOnInit() {
    this.categoriesByFranchise[environment.franchise + 1] =
      this.currentRoute.snapshot.data['categories'];
    for (
      let i = 0;
      i < this.categoriesByFranchise[environment.franchise + 1].length;
      i++
    ) {
      this.categoriesByFranchise[environment.franchise + 1][i].fullpath =
        (environment.franchise === 0 ? 'Ford/' : 'Lincoln/') +
        this.categoriesByFranchise[environment.franchise + 1][i].fullpath;
    }
    this.categories = [...this.categoriesByFranchise[environment.franchise + 1]];
    this.categoriesService
      .franchiseCategories(
        environment.franchise === 0 ? FranchiseType.Lincoln : FranchiseType.Ford
      )
      .subscribe(
        (response) => {
          for (let i = 0; i < response.length; i++) {
            response[i].fullpath =
              (environment.franchise === 0 ? 'Lincoln/' : 'Ford/') +
              response[i].fullpath;
          }
          this.categoriesByFranchise[environment.franchise === 0 ? 2 : 1] =
            response;
          this.categoriesByFranchise[0] = flattenDeep([
            this.categoriesByFranchise[1],
            this.categoriesByFranchise[2],
          ]);
        },
        (error) => console.log('Error: ', error)
      );

    this.franchiseCategories =
      this.currentRoute.snapshot.data['franchiseCategories'];
    this.marketGroups = this.currentRoute.snapshot.data['marketGroups'];
    this.marketGroupsCheckboxes = new Array<boolean>(this.marketGroups.length);
    this.marketGroupsCheckboxes.fill(false);
    this.roleGroups = this.currentRoute.snapshot.data['roleGroups'];
    this.roleGroupsCheckboxes = new Array<boolean>(this.roleGroups.length);
    this.roleGroupsCheckboxes.fill(false);
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
      makeOfficial: true,
    });
  }
}
