// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class PlaylistDetailsModel
    {

        public string FeaturedPlaylist { get; set; }

        public string PlaybackUrl { get; set; }

        public PlaylistVideoModel[] Videos { get; set; }

        public PlaylistModel[] Playlists { get; set; }

    }

}