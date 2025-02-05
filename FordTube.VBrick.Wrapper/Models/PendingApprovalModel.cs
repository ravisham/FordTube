// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class PendingApprovalModel
    {

        public string Id { get; set; }

        public string Title { get; set; }

        public string HtmlDescription { get; set; }

        public string ApprovalStatus { get; set; }

        public string ApprovalProcessName { get; set; }

        public string ApprovalProcessStepName { get; set; }

        public int ApprovalProcessStepNumber { get; set; }

        public int ApprovalProcessStepsCount { get; set; }

    }

}