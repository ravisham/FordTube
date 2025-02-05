// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class EventModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ListingType { get; set; }
        public string EventUrl { get; set; }
        public List<BackgroundImageModel> BackgroundImages { get; set; }
        public List<CategoryModel> Categories { get; set; }
        public List<string> Tags { get; set; }
        public bool Unlisted { get; set; }
        public int EstimatedAttendees { get; set; }
        public int LobbyTimeMinutes { get; set; }
        public string ShortcutName { get; set; }
        public string ShortcutNameUrl { get; set; }
        public string LinkedVideoId { get; set; }
        public bool AutoAssociateVod { get; set; }
        public bool RedirectVod { get; set; }
        public List<CustomFieldModel> CustomFields { get; set; }
        public string WebcastType { get; set; }
        public string PresenterId { get; set; }
        public List<string> PresenterIds { get; set; }
        public string AttendeeJoinMethod { get; set; }
        public List<ExternalPresenterModel> ExternalPresenters { get; set; }
        public PreProductionModel PreProduction { get; set; }
    }

}