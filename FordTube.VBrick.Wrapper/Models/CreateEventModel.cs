// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class CreateEventModel
    {

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

        public bool QuestionAndAnswerEnabled { get; set; }

        public string[] UserIds { get; set; }

        public string[] GgroupIds { get; set; }

        public string[] ModeratorIds { get; set; }

        public string Password { get; set; }

        //Allowed values: Public/AllUsers/Private
        public string AccessControl { get; set; }

        public string VcSipAddress { get; set; }

        //Allowed values: IDENTIFIED/SELFSELECT/ANONYMOUS
        public string QuestionOption { get; set; }

        public bool PresentationFileDownloadAllowed { get; set; }

    }

}