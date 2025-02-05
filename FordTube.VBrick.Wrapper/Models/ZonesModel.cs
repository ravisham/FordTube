// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class ZonesModel
    {

        public string AccountId { get; set; }

        public DefaultZoneModel DefaultZone { get; set; }

        public ZoneModel[] Zones { get; set; }

    }

}