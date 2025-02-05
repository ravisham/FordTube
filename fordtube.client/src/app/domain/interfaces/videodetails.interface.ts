

import { LinkedUrlModel } from './linkedurl.interface';
import { AccessControlEntityModel } from './accesscontrolentity.interface';
import { CustomFieldDetailsModel } from './customfielddetails.interface';
import { CategoryPathModel } from './categorypath.interface';
//import { AttachedFileModel } from './attachedfile.interface';
import { SupplementalFileModel } from './supplementalfile.interface';
import { FranchiseType } from '../enums/franchisetype.enum';
/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.VideoDetailsModel
  */
export interface VideoDetailsModel {

  ratingByUser?: number;
  id: string;
  rating: number;
  totalRatings?: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  linkedUrl: LinkedUrlModel;
  categories: string[];
  tags: string[];
  isActive: boolean;
  approvalStatus: string;
  enableRatings: boolean;
  enableDownloads: boolean;
  enableComments: boolean;
  videoAccessControl: string;
  password: string;
  status: string;
  canEdit: boolean;
  accessControlEntities: AccessControlEntityModel[];
  customFields: CustomFieldDetailsModel[];
  eDate: string;
  expirationDate?: Date;
  expirationAction: string;
  uploadedBy: string;
  whenUploaded?: Date;
  htmlDescription: string;
  pDate: string;
  publishDate?: Date;
  categoryPaths: CategoryPathModel[];
  sourceType: string;
  archived: boolean;
  flagged: boolean;
 // files: AttachedFileModel[];
  supplementalFiles: SupplementalFileModel[];
  franchise: FranchiseType;
  isDealer: boolean;
  businessOwnerName: string;
  businessOwnerEmail: string;
  contactsName: string;
  contactsEmail: string;
  notes: string;
  isOfficial: boolean;
  isRejected: boolean;
  isPendingApproval: boolean;
  isAdmin: boolean;
  is360: boolean;
  totalViews: number;
  srtFileName: string;
  restrictionCategories: string[];
}

