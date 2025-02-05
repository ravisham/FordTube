

import { VideoSearchResponseItemModel } from './videosearchresponseitem.interface';
import { ReportModel } from './report.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.FlaggedVideoItemModel
  */
export interface FlaggedVideoItemModel {

  video: VideoSearchResponseItemModel;
  reports: ReportModel[];
}

