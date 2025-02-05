using System;
using System.ComponentModel.DataAnnotations;
using FordTube.VBrick.Wrapper.Extensions.Serializers;
using Newtonsoft.Json;
using OneMagnify.Data.Ford.FordTube.Entities;

namespace FordTube.VBrick.Wrapper.Models
{
    public class SlideDtoModel
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

        [Range(0, 1)]
        public int Franchise { get; set; }

        [JsonConverter(typeof(Base64FileJsonConverter))]
        public byte[] BackgroundImage { get; set; }

        public string BackgroundImageUrl { get; set; }

        public string BackgroundColor { get; set; }

        [DataType(DataType.Url)]
        public string Link { get; set; }

        [DataType(DataType.Html)]
        public string Text { get; set; }

        [Range(0, 1)]
        public int? TextPosition { get; set; }

        public Slide ToSlide()
        {
            return new Slide
            {
                Id         = Id,
                ActiveDate = ActiveDate, 
                ActiveTime = ActiveTime,
                InactiveDate = InactiveDate,
                InactiveTime = InactiveTime,
                Franchise = Franchise, 
                BackgroundImageUrl = BackgroundImageUrl, 
                BackgroundColor = BackgroundColor,
                Link = Link, 
                Text = Text, 
                TextPosition = (int) TextPosition, 
            }; 
        }

        public static SlideDtoModel FromCreateSlideRequestModel(CreateSlideRequestModel model)
        {
            return new SlideDtoModel
            {
                ActiveDate         = model.ActiveDate,
                ActiveTime         = model.ActiveTime,
                InactiveDate       = model.InactiveDate,
                InactiveTime       = model.InactiveTime,
                Franchise          = model.Franchise,
                BackgroundImage    = model.BackgroundImage,
                BackgroundColor    = model.BackgroundColor,
                BackgroundImageUrl = null, 
                Link               = model.Link,
                Text               = model.Text,
                TextPosition       = model.TextPosition,
            };
        }

        public CreateSlideRequestModel ToCreateSlideRequestModel()
        {
            return new CreateSlideRequestModel
            {
                ActiveDate         = ActiveDate,
                ActiveTime         = ActiveTime,
                InactiveDate       = InactiveDate,
                InactiveTime       = InactiveTime,
                Franchise          = Franchise,
                BackgroundImage    = BackgroundImage,
                BackgroundColor    = BackgroundColor,
                Link               = Link,
                Text               = Text,
                TextPosition       = (int)TextPosition,
            };
        }
    }
}