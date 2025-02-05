using System;
using System.ComponentModel.DataAnnotations;

namespace FordTube.VBrick.Wrapper.Models
{

    public class SlideModel
    {
        public int Id { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime? ActiveDate { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan? ActiveTime { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime? InactiveDate { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan? InactiveTime { get; set; }

        public int Franchise { get; set; }

        [DataType(DataType.ImageUrl)]
        public string BackgroundImageUrl { get; set; }

        public string BackgroundColor { get; set; }

        [DataType(DataType.Url)]
        public string Link { get; set; }

        [DataType(DataType.Html)]
        public string Text { get; set; }

        public int? TextPosition { get; set; }


    }

}