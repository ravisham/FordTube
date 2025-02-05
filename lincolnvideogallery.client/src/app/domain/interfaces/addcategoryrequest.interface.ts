


import { FranchiseType } from '../enums/franchisetype.enum';
/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.AddCategoryRequestModel
  */
export interface AddCategoryRequestModel {

  name: string;
  parentCategoryId: string;
  franchise: FranchiseType;
}

