// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoReportModel
    {

        public string VideoId { get; set; }

        public string Title { get; set; }

        public string DateViewed { get; set; }

        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string EmailAddress { get; set; }

        public bool Completed { get; set; }

        public string Zone { get; set; }

        public string Device { get; set; }

        public string PlayBackUrl { get; set; }

        public string Browser { get; set; }

        public string UserDeviceType { get; set; }

        public string ViewingTime { get; set; }

        public string ViewingStartTime { get; set; }

        public string ViewingEndTime { get; set; }

    }

}