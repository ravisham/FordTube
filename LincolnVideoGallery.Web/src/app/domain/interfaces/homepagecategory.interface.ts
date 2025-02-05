

import { VideoSearchResponseItemModel } from './videosearchresponseitem.interface';
import { GetCategoryModel } from './getcategory.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.HomePageCategoryModel
  */
export interface HomePageCategoryModel {

  video: VideoSearchResponseItemModel;
  category: GetCategoryModel;
}

