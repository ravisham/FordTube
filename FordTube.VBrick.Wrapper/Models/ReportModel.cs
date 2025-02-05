using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class ReportModel
    {
        public int? Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string VideoId { get; set; }
        public string Comment { get; set; }
        public DateTime? CreatedOn { get; set; } = DateTime.Now;
        public bool? Reviewed { get; set; } = false;
    }
}
