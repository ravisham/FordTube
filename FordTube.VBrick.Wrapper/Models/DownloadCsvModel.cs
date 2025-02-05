using System;
using System.ComponentModel.DataAnnotations;

namespace FordTube.VBrick.Wrapper.Models
{
  public class DownloadCsvModel
  {
    public int Franchise { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime ToUploadDate { get; set; } = DateTime.Now.Date;

    [DataType(DataType.DateTime)]
    public DateTime FromUploadDate { get; set; } = DateTime.Now.Date.AddMonths(-1);

  }
}
