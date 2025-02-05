// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class ZoneDeviceModel
    {

        public string DeviceType { get; set; }

        public string Id { get; set; }

        public bool IsVideoStorageDevice { get; set; }

        public string MacAddress { get; set; }

        public string Name { get; set; }

        public bool PrepositionContent { get; set; }

        public string Status { get; set; }

        public string[] VideoStreams { get; set; }

    }

}