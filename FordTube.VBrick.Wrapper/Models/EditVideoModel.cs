// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using FordTube.VBrick.Wrapper.Enums;
using System;
using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class EditVideoModel
    {

        public string Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public List<string> Tags { get; set; }

        public List<string> Categories { get; set; }

        public DateTime? ExpirationDate { get; set; }

        public DateTime? PublishDate { get; set; }

        public string BusinessOwnerName { get; set; }

        public string BusinessOwnerEmail { get; set; }

        public string ContactsName { get; set; }

        public string ContactsEmail { get; set; }

        public string Notes { get; set; }

        public bool Is360 { get; set; }

        public bool EnableDownloads { get; set; }

        public VideoAccessControlType? VideoAccessControl { get; set; }

        public AccessControlEntityModel[] AccessControlEntities { get; set; }

        public string SrtFileName { get; set; }

    }

}