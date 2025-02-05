using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
  public class AddRatingResponseModel
  {
    public decimal AverageRating { get; set; }

    public int TotalRatings { get; set; }
  }
}
