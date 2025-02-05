// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using FordTube.WebApi.Models.Enums;
using Newtonsoft.Json;

namespace FordTube.WebApi.Models
{

    public class HealthModel
    {
        [JsonProperty(PropertyName = "Ford Tube Database")]
        public HealthComponentModel FordTubeDbStatus { get; set; }

        [JsonProperty(PropertyName = "FordInfo Database")]
        public HealthComponentModel FordInfoDbStatus { get; set; }

        [JsonProperty(PropertyName = "Vbrick")]
        public HealthComponentModel VBrickStatus { get; set; }

        [JsonProperty(PropertyName = "XApi")]
        public HealthComponentModel DataPowerXApiStatus { get; set; }
        
        [JsonProperty(PropertyName = "MongoDB")]
        public HealthComponentModel MongoDbStatus { get; set; }

        public string Message => FordInfoDbStatus.Status == HealthStatusEnum.HEALTHY && FordTubeDbStatus.Status == HealthStatusEnum.HEALTHY && MongoDbStatus.Status == HealthStatusEnum.HEALTHY && VBrickStatus.Status == HealthStatusEnum.HEALTHY  && DataPowerXApiStatus.Status == HealthStatusEnum.HEALTHY ? "Healthy" : "Broken";

    }

}