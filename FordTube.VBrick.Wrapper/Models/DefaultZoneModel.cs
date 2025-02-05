// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class DefaultZoneModel
    {

        public string Name { get; set; }

        public TargetDeviceModel[] TargetDevices { get; set; }

        public bool SupportsMulticast { get; set; }

        public SlideDelayModel SlideDelay { get; set; }

    }

}