


import { VideoType } from '../enums/videotype.enum';
import { VideoStatus } from '../enums/videostatus.enum';
import { SortFieldType } from '../enums/sortfieldtype.enum';
import { SortDirectionType } from '../enums/sortdirectiontype.enum';
import { SearchFieldType } from '../enums/searchfieldtype.enum';
/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.VideoSearchRequestModel
  */
export interface VideoSearchRequestModel {

  type: VideoType;
  categories: string[];
  uploaders: string[];
  uploaderIds: string[];
  status: VideoStatus;
  query: string;
  count: number;
  titleOnly: boolean;
  fromPublishedDate?: Date;
  toPublishedDate?: Date;
  fromUploadDate?: Date;
  toUploadDate?: Date;
  fromModifiedDate?: Date;
  toModifiedDate?: Date;
  scrollId: string;
  sortField: SortFieldType;
  sortDirection: SortDirectionType;
  exactMatch: boolean;
  searchField: SearchFieldType;
}

