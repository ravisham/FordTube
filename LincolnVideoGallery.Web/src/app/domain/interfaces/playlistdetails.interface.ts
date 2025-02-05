

import { PlaylistVideoModel } from './playlistvideo.interface';
import { PlaylistModel } from './playlist.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.PlaylistDetailsModel
  */
export interface PlaylistDetailsModel {

  featuredPlaylist: string;
  playbackUrl: string;
  videos: PlaylistVideoModel[];
  playlists: PlaylistModel[];
}

