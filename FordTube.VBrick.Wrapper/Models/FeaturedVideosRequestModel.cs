// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class FeaturedVideosRequestModel
    {

        public string[] Categories { get; set; }

        public int Count { get; set; } = 25;

        public string ScrollId { get; set; }

        public string Query { get; set; }

    }

}