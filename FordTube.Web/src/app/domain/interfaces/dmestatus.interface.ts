

import { PrincipalDataModel } from './principaldata.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.DmeStatusModel
  */
export interface DmeStatusModel {

  dmeUpTime: Date;
  dmeSystemTime: Date;
  dmeVersion: string;
  rtmpServerVersion: string;
  connectionCount: number;
  rtmpServerConnectionsCount: number;
  multiProtocolMaxCount: number;
  rtpConnectionsCount: number;
  rtpConnectionsMaxCount: number;
  iscsiUsage: boolean;
  ipAddress: string;
  id: string;
  version: string;
  createdBy: PrincipalDataModel;
  modifiedBy: PrincipalDataModel;
  isCollectable: boolean;
}

