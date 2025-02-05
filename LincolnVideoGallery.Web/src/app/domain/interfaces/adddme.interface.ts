

import { ManualVideoStreamModel } from './manualvideostream.interface';
import { VideoStreamsGroupModel } from './videostreamsgroup.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.AddDmeModel
  */
export interface AddDmeModel {

  name: string;
  macAddress: string;
  isActive: boolean;
  prepositionContent: boolean;
  isVideoStorageDevice: boolean;
  manualVideoStreams: ManualVideoStreamModel[];
  videoStreamsGroupsToAdd: VideoStreamsGroupModel[];
}

