

import { PlaylistVideoModel } from './playlistvideo.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.PlaylistModel
  */
export interface PlaylistModel {

  id: string;
  name: string;
  playbackUrl: string;
  videos: PlaylistVideoModel[];
}

