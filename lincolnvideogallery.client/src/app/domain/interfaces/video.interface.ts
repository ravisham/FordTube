

import { AccessControlEntityModel } from './accesscontrolentity.interface';
import { CustomFieldModel } from './customfield.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.VideoModel
  */
export interface VideoModel {

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
  accessControlEntities: AccessControlEntityModel[];
  customFields: CustomFieldModel[];
  doNotTranscode: boolean;
}

