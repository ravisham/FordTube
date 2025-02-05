

import { CommentItemModel } from './commentitem.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.AddReviewResponseModel
  */
export interface AddReviewResponseModel {

  comments: CommentItemModel[];
  averageRating: number;
  totalRatings: number;
}

