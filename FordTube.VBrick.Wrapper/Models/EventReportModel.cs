// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class EventReportModel
    {

        public string Browser { get; set; }

        public string DeviceAccessed { get; set; }

        public string DeviceType { get; set; }

        public string Email { get; set; }

        public DateTime EnteredDate { get; set; }

        public DateTime ExitedDate { get; set; }

        public string IpAddress { get; set; }

        public string Name { get; set; }

        public string StreamAccessed { get; set; }

        public string UserName { get; set; }

        public string UserType { get; set; }

        public string Zone { get; set; }

    }

}