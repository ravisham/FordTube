﻿// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class UploadVideoRequestModel
    {

        public VideoModel Video { get; set; } = new VideoModel();

        public byte[] VideoFile { get; set; }

    }

}