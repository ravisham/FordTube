using FordTube.WebApi.Models.Enums;

namespace FordTube.WebApi.Models
{

    public class HealthComponentModel
    {
        public HealthComponentModel() { Status = HealthStatusEnum.HEALTHY; }

        public HealthStatusEnum Status { get; set; }

        public string StatusText => Status == HealthStatusEnum.HEALTHY ? "Healthy" : "Broken";

        public string Message { get; set; } = "Functioning as intended.";

    }

}
