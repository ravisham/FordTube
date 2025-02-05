// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoSearchResponseModel
    {

        public VideoSearchResponseItemModel[] Videos { get; set; }

        public int TotalVideos { get; set; }

        public string ScrollId { get; set; }

    }

}