
using System.ComponentModel;

namespace FordTube.WebApi.Models.Enums
{
    public enum HealthStatusEnum
    {
        [Description("Healthy")]
        HEALTHY = 0,

        [Description("Broken")]
        BROKEN = 1
    }
}
