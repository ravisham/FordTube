// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class ZoneModel
    {

        public string Id { get; set; }

        public string ParentZoneId { get; set; }

        public string[] IpAddresses { get; set; }

        public IpAddressesRangeModel[] IpAddressRangesModel { get; set; }

        public TargetDeviceModel[] TargetDevices { get; set; }

        public ZoneModel[] ChildZones { get; set; }

        public bool SupportsMulticast { get; set; }

        public SlideDelayModel SlideDelay { get; set; }

    }

}