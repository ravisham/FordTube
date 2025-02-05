

import { AccessControlEntityModel } from './accesscontrolentity.interface';
import { VideoAccessControlType } from '../enums/videoaccesscontroltype.enum';
/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.UploadVideoModel
  */
export interface UploadVideoModel {

  title: string;
  description: string;
  fileName: string;
  data: number[];
  tags: string[];
  uploader: string;
  categories: string[];
  videoAccessControl?: VideoAccessControlType;
  accessControlEntities: AccessControlEntityModel[];
  enableDownloads: boolean;
  expirationDate?: Date;
  publishDate?: Date;
  franchiseCategories: string[];
  placeholder: boolean;
  businessOwnerName: string;
  businessOwnerEmail: string;
  contactsName: string;
  contactsEmail: string;
  partOfSeries: boolean;
  notes: string;
  is360: boolean;
  srtFileName: string;
}

