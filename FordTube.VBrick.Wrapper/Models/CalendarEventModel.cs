// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class CalendarEventModel
    {

        /// <inheritdoc />
        public string CalendarName { get; set; }

        /// <inheritdoc />
        public string Description { get; set; }

        /// <inheritdoc />
        public string Location { get; set; }

        /// <inheritdoc />
        public DateTime EndDateTime { get; set; }

        /// <inheritdoc />
        public DateTime StartDateTime { get; set; }

        /// <inheritdoc />
        public string Title { get; set; }

        /// <inheritdoc />
        public string Url { get; set; }

        /// <inheritdoc />
        public string Version { get; set; }

        /// <inheritdoc />
        public string AlarmTrigger { get; set; } = "30";

        /// <inheritdoc />
        public string AlarmRepeat { get; set; } = "2";

        /// <inheritdoc />
        public string AlarmDuration { get; set; } = "15";

    }

}