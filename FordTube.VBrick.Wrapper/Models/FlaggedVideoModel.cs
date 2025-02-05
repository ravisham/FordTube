using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class FlaggedVideoModel
    {
        public List<FlaggedVideoItemModel> Videos { get; set; }
        public int TotalVideos { get; set; }
        public string ScrollId { get; set; }
    }
}
