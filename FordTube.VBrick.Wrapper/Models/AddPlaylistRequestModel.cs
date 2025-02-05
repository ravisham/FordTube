// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddPlaylistRequestModel
    {

        public string Name { get; set; }

        public List<string> VideoIds { get; set; }

    }

}