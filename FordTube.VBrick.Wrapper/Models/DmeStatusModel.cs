// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class DmeStatusModel
    {

        public DateTime DmeUpTime { get; set; }

        public DateTime DmeSystemTime { get; set; }

        public string DmeVersion { get; set; }

        public string RtmpServerVersion { get; set; }

        public int ConnectionCount { get; set; }

        public int RtmpServerConnectionsCount { get; set; }

        public int MultiProtocolMaxCount { get; set; }

        public int RtpConnectionsCount { get; set; }

        public int RtpConnectionsMaxCount { get; set; }

        public bool IscsiUsage { get; set; }

        public string IpAddress { get; set; }

        public string Id { get; set; }

        public string Version { get; set; }

        public PrincipalDataModel CreatedBy { get; set; }

        public PrincipalDataModel ModifiedBy { get; set; }

        public bool IsCollectable { get; set; }

    }

}