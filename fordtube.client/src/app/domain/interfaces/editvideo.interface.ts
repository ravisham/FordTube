

import { AccessControlEntityModel } from './accesscontrolentity.interface';
import { VideoAccessControlType } from '../enums/videoaccesscontroltype.enum';
/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.EditVideoModel
  */
export interface EditVideoModel {

  id: string;
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  expirationDate?: Date;
  publishDate?: Date;
  businessOwnerName: string;
  businessOwnerEmail: string;
  contactsName: string;
  contactsEmail: string;
  notes: string;
  is360: boolean;
  enableDownloads: boolean;
  videoAccessControl?: VideoAccessControlType;
  accessControlEntities: AccessControlEntityModel[];
  srtFileName: string;
}

