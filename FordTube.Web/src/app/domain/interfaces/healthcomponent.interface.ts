


import { HealthStatusEnum } from '../enums/healthstatusenum.enum';
/**
  * Model/Interface for: FordTube.WebApi.Models.HealthComponentModel
  */
export interface HealthComponentModel {

  status: HealthStatusEnum;
  statusText: string;
  message: string;
}

