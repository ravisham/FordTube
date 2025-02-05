

import { IpAddressesRangeModel } from './ipaddressesrange.interface';
import { TargetDeviceModel } from './targetdevice.interface';
import { SlideDelayModel } from './slidedelay.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.ZoneModel
  */
export interface ZoneModel {

  id: string;
  parentZoneId: string;
  ipAddresses: string[];
  ipAddressRangesModel: IpAddressesRangeModel[];
  targetDevices: TargetDeviceModel[];
  childZones: ZoneModel[];
  supportsMulticast: boolean;
  slideDelay: SlideDelayModel;
}

