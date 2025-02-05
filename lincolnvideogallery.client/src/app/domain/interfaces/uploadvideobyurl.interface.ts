

import { AccessControlEntityModel } from './accesscontrolentity.interface';
import { CustomFieldModel } from './customfield.interface';
import { LinkedUrlModel } from './linkedurl.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.UploadVideoByUrlModel
  */
export interface UploadVideoByUrlModel {

  title: string;
  description: string;
  uploader: string;
  categories: string[];
  categoryIds: string[];
  tags: string[];
  isActive: boolean;
  enableRatings: boolean;
  enableDownloads: boolean;
  enableComments: boolean;
  videoAccessControl: string;
  password: string;
  accessControlEntities: AccessControlEntityModel[];
  customFields: CustomFieldModel[];
  linkedUrl: LinkedUrlModel;
}

