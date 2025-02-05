using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FordTube.VBrick.Wrapper.Models
{
    /// <summary>
    /// Vbrick REV 'summary-statistics' Video Summary Statistics Request Structure.
    /// </summary>
    public class VideoSummaryStatisticsRequest
    {
        public string After { get; set; }
        public string Before { get; set; }
    }
}
