namespace FordTube.WebApi.Models
{
    /// <summary>
    /// The model used by us to generate the Active video's report.
    /// </summary>
    public class ActiveVideoReport
    {
        public string VideoTitle { get; set; }
        public DateTime? UploadDate { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime? ModifyDate { get; set; }
        public int Last30DaysViews { get; set; }
        public int CurrentYTDViews { get; set; }
        public int ViewsSincePublished { get; set; }

        public string VideoId { get; set; }
    }
}
