// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoPlaybackUrlResponseItemModel
    {

        public string Id { get; set; }

        public string Title { get; set; }

        public List<CategoryModel> Categories { get; set; }

        public List<string> FeaturedCategories { get; set; }

        public string Description { get; set; }

        public string HtmlDescription { get; set; }

        public List<string> Tags { get; set; }

        public string ThumbnailUrl { get; set; }

        public string PlaybackUrl { get; set; }

    }

}