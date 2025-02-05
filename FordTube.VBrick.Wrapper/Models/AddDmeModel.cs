// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddDmeModel
    {

        public string Name { get; set; }

        public string MacAddress { get; set; }

        public bool IsActive { get; set; }

        public bool PrepositionContent { get; set; }

        public bool IsVideoStorageDevice { get; set; }

        public List<ManualVideoStreamModel> ManualVideoStreams { get; set; } = new List<ManualVideoStreamModel>();

        public List<VideoStreamsGroupModel> VideoStreamsGroupsToAdd { get; set; } = new List<VideoStreamsGroupModel>();

    }

}