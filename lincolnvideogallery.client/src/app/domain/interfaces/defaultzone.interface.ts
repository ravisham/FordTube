

import { TargetDeviceModel } from './targetdevice.interface';
import { SlideDelayModel } from './slidedelay.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.DefaultZoneModel
  */
export interface DefaultZoneModel {

  name: string;
  targetDevices: TargetDeviceModel[];
  supportsMulticast: boolean;
  slideDelay: SlideDelayModel;
}

