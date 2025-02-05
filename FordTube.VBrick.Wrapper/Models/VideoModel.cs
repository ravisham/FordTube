using FordTube.VBrick.Wrapper.Enums;
using System;
using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{
    public class VideoModel
    {

        public string Title { get; set; }

        public string Description { get; set; }

        public string Uploader { get; set; }

        public List<string> Categories { get; set; } = new List<string>();

        public List<string> CategoryIds { get; set; } = new List<string>();

        public List<string> Tags { get; set; } = new List<string>();

        public bool IsActive { get; set; } = true;

        public bool EnableRatings { get; set; } = true;

        public bool EnableDownloads { get; set; } = false;

        public bool EnableComments { get; set; } = true;

        public string VideoAccessControl { get; set; } = "AllUsers";

        public List<AccessControlEntityModel> AccessControlEntities { get; set; } =
            new List<AccessControlEntityModel>();

        public List<CustomFieldModel> CustomFields { get; set; } = new List<CustomFieldModel>();

        public bool DoNotTranscode { get; set; } = false;

    }
}