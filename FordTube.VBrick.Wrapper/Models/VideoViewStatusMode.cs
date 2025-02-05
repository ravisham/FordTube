// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoViewStatusMode
    {

        public string UserId { get; set; }

        public string VideoId { get; set; }

        public bool Completed { get; set; }

        public DateTime? WhenCompleted { get; set; }

    }

}