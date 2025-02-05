namespace FordTube.WebApi.Models
{
    /// <summary>
    /// The model used by us to generate the Inactive/Deleted video's report.
    /// </summary>
    public class InactiveDeletedVideoReport
    {
        public string VideoTitle { get; set; }
        public DateTime? UploadDate { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime? ModifyDate { get; set; }
        public DateTime? InactiveDeletedDate { get; set; }
        public DateTime? ScheduledInactiveDeleteDate { get; set; }
        public string VideoId { get; set; }
        public string ViewsSincePublished { get; set; }

    }
}
