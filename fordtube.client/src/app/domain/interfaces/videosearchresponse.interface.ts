

import { VideoSearchResponseItemModel } from './videosearchresponseitem.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.VideoSearchResponseModel
  */
export interface VideoSearchResponseModel {

  videos: VideoSearchResponseItemModel[];
  totalVideos: number;
  scrollId: string;
}

