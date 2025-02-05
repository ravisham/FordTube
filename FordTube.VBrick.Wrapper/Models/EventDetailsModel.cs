// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class EventDetailsModel
    {

        public string EventId { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string PresentationProfileId { get; set; }

        public string EventAdminId { get; set; }

        public string[] EventAdminIds { get; set; }

        public bool AutomatedWebcast { get; set; }

        public bool ClosedCaptionsEnabled { get; set; }

        public bool PollsEnabled { get; set; }

        public bool ChatEnabled { get; set; }

        public string ForceAnonymousQuestions { get; set; }

        public bool QuestionAndAnswerEnabled { get; set; }

        public string[] UserIds { get; set; }

        public string[] GroupIds { get; set; }

        public string Password { get; set; }

        public string AccessControl { get; set; }

        public string EventUrl { get; set; }

        public string IcsFileUrl { get; set; }

        public string vcSipAddress { get; set; }

        public bool Unlisted { get; set; }

        public CustomFieldDetailsModel[] CustomFields { get; set; }

    }

}