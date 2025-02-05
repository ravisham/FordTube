// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoFieldModel
    {

        public string Id { get; set; }

        public string Name { get; set; }

        public string FieldType { get; set; }

        public bool Required { get; set; }

        public bool DisplayedToUsers { get; set; }

        public string Options { get; set; }

    }

}