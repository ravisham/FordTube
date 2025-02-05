using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class UserLoginReportItemModel
    {
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Username { get; set; }
        public DateTime LastLogin { get; set; }
    }
}
