


import { MarketsType } from '../enums/marketstype.enum';
/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.CheckPermissionsModel
  */
export interface CheckPermissionsModel {

  videoId: string;
  market?: MarketsType;
  role: string;
  isDealer: boolean;
}

