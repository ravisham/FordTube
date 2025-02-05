// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddOrEditZoneModel
    {

        public string Name { get; set; }

        public bool SupportsMulticast { get; set; }

        public string[] IpAddresses { get; set; }

        public AddZoneTargetDeviceModel[] TargetDevices { get; set; }

        public bool OverrideAccountSlideDelay { get; set; }

        public int SlideDelaySeconds { get; set; }

    }

}