using System;
using System.ComponentModel.DataAnnotations;
using FordTube.VBrick.Wrapper.Extensions.Serializers;
using Newtonsoft.Json;

namespace FordTube.VBrick.Wrapper.Models
{

    public class CreateSlideRequestModel
    {

        [DataType(DataType.DateTime)]
        public DateTime? ActiveDate { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan? ActiveTime { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime? InactiveDate { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan? InactiveTime { get; set; }

        [Range(0, 1)]
        public int Franchise { get; set; }

        [JsonConverter(typeof(Base64FileJsonConverter))]
        public byte[] BackgroundImage { get; set; }

        public string BackgroundColor { get; set; }

        [DataType(DataType.Url)]
        public string Link { get; set; }

        public string Text { get; set; }

        [Range(0, 1)]
        public int TextPosition { get; set; }

    }

}
