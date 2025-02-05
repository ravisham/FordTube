// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using FordTube.VBrick.Wrapper.Enums;
using Newtonsoft.Json;

namespace FordTube.VBrick.Wrapper.Models
{

    public class PlaylistVideoActionModel
    {

        public string VideoId { get; set; }

        [JsonIgnore]
        public PlaylistVideoActionType ActionEnum { get; set; }

        public string Action => ActionEnum.ToString();

    }

}