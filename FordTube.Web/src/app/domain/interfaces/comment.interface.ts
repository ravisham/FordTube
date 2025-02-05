

import { CommentItemModel } from './commentitem.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.CommentModel
  */
export interface CommentModel {

  id: string;
  title: string;
  comments: CommentItemModel[];
}

