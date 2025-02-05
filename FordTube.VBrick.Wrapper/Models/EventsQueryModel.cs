// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class EventsQueryModel
    {

        //public string ScrollId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string SortField { get; set; } = "startDate";
        public string SortDirection { get; set; } = "asc";
        public int Size { get; set; } = 50;  //50 is the default value in the Rev API
        public List<CustomFieldModel> CustomFields { get; set; }

    }
}