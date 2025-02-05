// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoReportQueryModel
    {

        public List<string> VideoIds { get; set; } = new List<string>();

        public DateTime? After { get; set; }

        public DateTime? Before { get; set; }


        public override string ToString()
        {
            var result = new StringBuilder();

            if (VideoIds.Count > 0)
            {
                result.Append("?videoIds=");
                result.Append(string.Join(",", VideoIds.ToArray()));
            }

            if (After != null)
            {
                result.Append(result.Length == 0 ? "?" : "&");
                result.Append("after=");
                result.Append(After.Value.ToString(Constants.DATE_FORMAT));
            }

            if (Before != null)
            {
                result.Append(result.Length == 0 ? "?" : "&");
                result.Append("before=");
                result.Append(Before.Value.ToString(Constants.DATE_FORMAT));
            }

            return result.ToString();
        }

    }

}