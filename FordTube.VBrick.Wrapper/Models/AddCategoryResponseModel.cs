namespace FordTube.VBrick.Wrapper.Models
{
    public class AddCategoryResponseModel
    {

        public string CategoryId { get; set; }

        public string Name { get; set; }

        public AddCategoryResponseModel ParentCategory { get; set; }

    }
}