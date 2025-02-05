namespace FordTube.WebApi.Models.Mongo
{
    /// <summary>
    /// Represents the data for a MongoDB task model.
    /// </summary>
    public class MongoTaskModel
    {
        public string VideoId { get; set; }
        public DateTime ScheduledActionDate { get; set; }
    }
}
