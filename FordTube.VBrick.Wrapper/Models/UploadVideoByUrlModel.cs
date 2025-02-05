// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class UploadVideoByUrlModel
    {

        public string Title { get; set; }

        public string Description { get; set; }

        public string Uploader { get; set; }

        public List<string> Categories { get; set; } = new List<string>();

        public List<string> CategoryIds { get; set; } = new List<string>();

        public List<string> Tags { get; set; } = new List<string>();

        public bool IsActive { get; set; } = true;

        public bool EnableRatings { get; set; } = true;

        public bool EnableDownloads { get; set; } = true;

        public bool EnableComments { get; set; } = true;

        public string VideoAccessControl { get; set; }

        public string Password { get; set; }

        public List<AccessControlEntityModel> AccessControlEntities { get; set; } = new List<AccessControlEntityModel>();

        public List<CustomFieldModel> CustomFields { get; set; } = new List<CustomFieldModel>();

        public LinkedUrlModel LinkedUrl { get; set; }

    }

}