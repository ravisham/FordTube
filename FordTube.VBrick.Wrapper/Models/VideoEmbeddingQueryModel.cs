// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoEmbeddingQueryModel
    {

        public string Url { get; set; }

        public int? Height { get; set; }

        public int? Width { get; set; }

        public bool? Autoplay { get; set; }


        public override string ToString()
        {
            var result = new StringBuilder("?url=");
            result.Append(Url);

            if (Height != null)
            {
                result.Append("&height=");
                result.Append(Height);
            }

            if (Width != null)
            {
                result.Append("&width=");
                result.Append(Width);
            }

            if (Autoplay != null)
            {
                result.Append("&autoplay=");
                result.Append(Autoplay.ToString().ToLower());
            }

            return result.ToString();
        }

    }

}