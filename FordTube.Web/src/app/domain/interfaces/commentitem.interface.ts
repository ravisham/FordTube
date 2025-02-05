/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.CommentItemModel
  */
export interface CommentItemModel {

  id: string;
  text: string;
  userName: string;
  firstName: string;
  lastName: string;
  date: Date;
  relativeDate?: string;
  isRemoved?: boolean;
  childComments: CommentItemModel[];
}

