// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited


using Newtonsoft.Json;


namespace FordTube.VBrick.Wrapper.Models
{

    public class EditRatingModel
    {

        [JsonProperty("rating")]
        public string Rating { get; set; }


        [JsonProperty("videoId")]
        public string VideoId { get; set; }

    }

}