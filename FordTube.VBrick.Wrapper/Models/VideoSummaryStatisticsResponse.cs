namespace FordTube.VBrick.Wrapper.Models
{
    /// <summary>
    /// Vbrick REV 'summary-statistics' Video Summary Statistics Response Structure.
    /// </summary>
    public class VideoSummaryStatisticsResponse
    {
        public int TotalViews { get; set; }
        public int UniqueViews { get; set; }
        public double CompletionRate { get; set; }

    }
}
