
using Newtonsoft.Json;

namespace FordTube.VBrick.Wrapper.Models
{
    public class ApiAuthenticateModel
    {
        [JsonProperty("apiKey")]
        public string   ApiKey { get; set; }


        [JsonProperty("secret")]
        public string   Secret { get; set; }
        
    }
}
