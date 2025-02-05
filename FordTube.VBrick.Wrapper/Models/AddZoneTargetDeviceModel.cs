// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddZoneTargetDeviceModel
    {

        public string DeviceType { get; set; }

        public string DeviceId { get; set; }

        public bool IsActive { get; set; }

        public string[] VideoStreams { get; set; }

    }

}