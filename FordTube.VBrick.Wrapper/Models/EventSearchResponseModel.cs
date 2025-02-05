using System.Collections.Generic;

using Newtonsoft.Json;

namespace FordTube.VBrick.Wrapper.Models
{
    public class EventSearchResponseModel
    {
        [JsonProperty("scrollId")]
        public string ScrollId { get; set; }

        [JsonProperty("events")]
        public List<EventModel> Events { get; set; }

        //[JsonProperty("total")]
        //public int Total { get; set; }
    }
}
