using FordTube.WebApi.Models.Mongo;

namespace FordTube.WebApi.Models.Mongo;

/// <summary>
/// Represents the data for merging video and task information.
/// </summary>
public class MongoVideoTaskData {

    public MongoVideoModel Video { get; set; }


    public MongoTaskModel Task { get; set; }

}

