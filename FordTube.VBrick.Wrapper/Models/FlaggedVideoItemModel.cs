using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class FlaggedVideoItemModel
    {
        public VideoSearchResponseItemModel Video { get; set; }
        public List<ReportModel> Reports { get; set; }
    }
}
