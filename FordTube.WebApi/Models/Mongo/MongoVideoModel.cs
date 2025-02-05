using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace FordTube.WebApi.Models.Mongo;

public class MongoVideoModel
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; }

    public string VideoId { get; set; }
    public bool IsActive { get; set; }
    public string Title { get; set; }
    public MongoVideoOwner Owner { get; set; }
    public List<MongoVideoCustomField> CustomFields { get; set; }
    public List<string> Tags { get; set; }
    public int ViewCountLast30Days { get; set; }
    public DateTime LastModified { get; set; }
    public DateTime? LastViewed { get; set; }
    public DateTime LastPublished { get; set; }
    public DateTime WhenUploaded { get; set; }

    public MongoVideoDetails Details { get; set; }


    public class MongoVideoDetails {

        public int TotalViews { get; set; }

    }
}

public class MongoVideoOwner
{
    public string UserId { get; set; }
    public string Username { get; set; }
}

public class MongoVideoCustomField
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Value { get; set; }
}