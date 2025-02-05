using FordTube.VBrick.Wrapper.Enums;

namespace FordTube.VBrick.Wrapper.Models
{
    public class AddCategoryRequestModel
    {

        public string Name { get; set; }

        public string ParentCategoryId { get; set; }

        public FranchiseType Franchise { get; set; }
    }
}