// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoStatusModel
    {

        public string VideoId { get; set; }

        public string Title { get; set; }

        public string Status { get; set; }

        public bool IsActive { get; set; }

        public string UploadedBy { get; set; }

        public DateTime WhenUploaded { get; set; }

    }

}