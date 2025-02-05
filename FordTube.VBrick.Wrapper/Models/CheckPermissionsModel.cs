using FordTube.VBrick.Wrapper.Enums;

namespace FordTube.VBrick.Wrapper.Models
{
    public class CheckPermissionsModel
    {

        public string VideoId { get; set; }

        public MarketsType? Market { get; set; }

        public string Role { get; set; }

        public bool IsDealer { get; set; }
    }
}
