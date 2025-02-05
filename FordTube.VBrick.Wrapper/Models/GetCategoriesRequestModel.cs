using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class GetCategoriesRequestModel
    {
        public string ParentCategoryId { get; set; }

        public bool IncludeAllDescendants { get; set; } = true;

        public override string ToString()
        {
            StringBuilder result = new StringBuilder();
            if (ParentCategoryId != null || !IncludeAllDescendants)
            {
                result.Append("?");
                if (ParentCategoryId != null)
                {
                    result.Append("parentCategoryId=");
                    result.Append(ParentCategoryId);
                    if (!IncludeAllDescendants)
                    {
                        result.Append("&");
                    }
                }
                if (!IncludeAllDescendants)
                {
                    result.Append("includeAllDescendants=false");
                }
            }
            return result.ToString();
        }
    }
}
