

import { DmeStatusModel } from './dmestatus.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.DmeDeviceItemModel
  */
export interface DmeDeviceItemModel {

  name: string;
  id: string;
  macAddress: string;
  status: string;
  prepositionContent: boolean;
  isVideoStorageDevice: boolean;
  dmeStatusModel: DmeStatusModel;
  ipAddress: string;
}

