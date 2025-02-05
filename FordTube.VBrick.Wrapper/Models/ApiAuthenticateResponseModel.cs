using System;
using Newtonsoft.Json;

namespace FordTube.VBrick.Wrapper.Models
{
    public class ApiAuthenticateResponseModel {
        [JsonProperty("token")]
        public string Token { get; set; }


        [JsonProperty("issuer")]
        public string Issuer { get; set; }


        [JsonProperty("expiration")]
        
        public DateTimeOffset Expiration { get; set; }
    }
}
