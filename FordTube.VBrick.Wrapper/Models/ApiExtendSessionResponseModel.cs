using System;
using Newtonsoft.Json;

namespace FordTube.VBrick.Wrapper.Models
{
    public class ApiExtendSessionResponseModel
    {
        [JsonProperty("expiration")]
        public DateTimeOffset Expiration { get; set; }
    }
}
