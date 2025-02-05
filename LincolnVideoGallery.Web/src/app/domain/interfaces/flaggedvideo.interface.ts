

import { FlaggedVideoItemModel } from './flaggedvideoitem.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.FlaggedVideoModel
  */
export interface FlaggedVideoModel {

  videos: FlaggedVideoItemModel[];
  totalVideos: number;
  scrollId: string;
}

