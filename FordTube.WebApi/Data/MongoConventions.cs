using MongoDB.Bson.Serialization.Conventions;


namespace FordTube.WebApi.Data;

public static class MongoConventions
{
    public static void RegisterConventions()
    {
        var conventionPack = new ConventionPack
        {
            new IgnoreExtraElementsConvention(true),
            new IgnoreIfNullConvention(true),
            new CamelCaseElementNameConvention()
        };

        ConventionRegistry.Register("CustomConventions", conventionPack, t => true);
    }
}