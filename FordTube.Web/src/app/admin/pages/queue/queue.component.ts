import { Component, OnInit } from '@angular/core';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';
import { VideoSearchResponseItemModel } from '../../../domain/interfaces/videosearchresponseitem.interface';
import { VideoService } from '../../../domain/services/video.service';
import { flattenDeep } from 'lodash';
import { environment } from '../../../../environments/environment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DownloadCsvModel } from '../../../domain/interfaces/downloadcsv.interface';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  videos: VideoSearchResponseItemModel[] = [];
  totalVideos = 0;
  scrollId = '';
  currentMenuItem = AdminMenuItems.AdminQueue;
  reverseSort = false;
  sortField = 'whenUploaded';
  csvStarted = false;
  downloadCsvModel = {
    franchise: environment.franchise,
    toUploadDate: null,
    fromUploadDate: null
  } as DownloadCsvModel;
  csvError = false;
  modal: NgbModalRef;

  constructor(
    private videosService: VideoService,
    private modalService: NgbModal
  ) {}

  openCsvModal(content: any) {
    this.modal = this.modalService.open(content, {
      size: 'lg',
      centered: true
    });
  }

  downloadCsv() {
    this.csvStarted = true;
    this.videosService
      .getQueueCsv(this.downloadCsvModel)
      .subscribe((response: any) => {
        // tslint:disable-next-line: prefer-const
        let fileResult = new Blob([response.body], {
          type: 'text/csv;charset=utf-8;'
        });

        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          window.navigator.msSaveOrOpenBlob(fileResult, 'report.csv');
        } else {
          const url = window.URL.createObjectURL(fileResult);

          // tslint:disable-next-line: prefer-const
          let downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = 'report.csv';

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          this.modal.close();
          this.csvError = false;
          this.downloadCsvModel = {
            franchise: environment.franchise,
            toUploadDate: null,
            fromUploadDate: null
          } as DownloadCsvModel;
          this.csvStarted = false;
        }
      });
    }

  setSortField(field: string) {
    if (field !== this.sortField) {
      this.reverseSort = false;
      this.sortField = field;
      return;
    }
    this.reverseSort = !this.reverseSort;
  }

  removeVideo(videoId) {
    this.scrollId = null;
    this.videosService.deleteRequest(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.id !== videoId;
        });
        this.videos = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  approveVideo(videoId) {
    this.scrollId = null;
    this.videosService.approve(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.id !== videoId;
        });
        this.videos = filtered;
        console.log(this.videos);
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  rejectVideo(videoId) {
    this.scrollId = null;
    this.videosService.rejectRequest(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.id !== videoId;
        });
        this.videos = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  fillVideos() {
    this.videosService.videosForApproval(this.scrollId).subscribe(
      result => {
        if (
          result != null &&
          result.videos != null &&
          result.videos.length > 0
        ) {
          this.scrollId = result.scrollId;
          this.totalVideos = result.totalVideos;
          this.videos = flattenDeep([this.videos, result.videos]);
          console.log(this.videos);
        }
      },
      error => console.log('Error: ', error)
    );
  }

  allowNextButton() {
    if (this.videos.length > 0) {
      return this.totalVideos > this.videos.length;
    } else {
      return true;
    }
  }

  loadMore() {
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    if (!this.videos.length) {
      this.fillVideos();
    }
  }
}
