

import { AddZoneTargetDeviceModel } from './addzonetargetdevice.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.AddOrEditZoneModel
  */
export interface AddOrEditZoneModel {

  name: string;
  supportsMulticast: boolean;
  ipAddresses: string[];
  targetDevices: AddZoneTargetDeviceModel[];
  overrideAccountSlideDelay: boolean;
  slideDelaySeconds: number;
}

