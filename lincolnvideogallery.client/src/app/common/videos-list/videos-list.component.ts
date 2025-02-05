import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { VideoSearchResponseItemModel } from '../../domain/interfaces/videosearchresponseitem.interface';

@Component({
  selector: 'app-videos-list',
  templateUrl: './videos-list.component.html',
  styleUrls: ['./videos-list.component.scss']
})
export class VideosListComponent {
  @Input()
  showLoadingTiles = false;
  @Input()
  videos: VideoSearchResponseItemModel[] = [];
  @Input()
  totalVideos: number = 0;
  @Input()
  scrollId: string = '';
  @Output()
  moreEvent = new EventEmitter<string>();

  constructor() {
    this.videos = [];
    this.totalVideos = 0;
    this.scrollId = '';
  }

  allowNextButton() {
    return this.totalVideos > this.videos.length;
  }


  moreVideos() {
    this.moreEvent.emit(this.videos.length > 0 ? this.scrollId : undefined);
    return false;
  }
}
