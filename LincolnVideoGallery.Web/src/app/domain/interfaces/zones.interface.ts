

import { DefaultZoneModel } from './defaultzone.interface';
import { ZoneModel } from './zone.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.ZonesModel
  */
export interface ZonesModel {

  accountId: string;
  defaultZone: DefaultZoneModel;
  zones: ZoneModel[];
}

