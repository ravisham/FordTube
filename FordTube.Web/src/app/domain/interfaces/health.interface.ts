

import { HealthComponentModel } from './healthcomponent.interface';

/**
  * Model/Interface for: FordTube.WebApi.Models.HealthModel
  */
export interface HealthModel {

  fordTubeDbStatus: HealthComponentModel;
  fordInfoDbStatus: HealthComponentModel;
  vBrickStatus: HealthComponentModel;
  dataPowerXApiStatus: HealthComponentModel;
  message: string;
}

