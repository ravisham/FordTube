// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoSearchResponseItemModel
    {

        public string Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string[] Categories { get; set; }

        public string[] Tags { get; set; }

        public string ThumbnailUrl { get; set; }

        public string PlaybackUrl { get; set; }

        public string Duration { get; set; }

        public float ViewCount { get; set; }

        public string Status { get; set; }

        public string ApprovalStatus { get; set; }

        public string ApprovalProcessName { get; set; }

        public string ApprovalProcessStepName { get; set; }

        public int ApprovalProcessStepNumber { get; set; }

        public int ApprovalProcessStepsCount { get; set; }

        public string UploadedBy { get; set; }

        public DateTime WhenUploaded { get; set; }

        public DateTime WhenModified { get; set; }

        public float AverageRating { get; set; }

        public int RatingsCount { get; set; }

        public SpeechResultModel[] SpeechResult { get; set; }

        public bool PartOfSeries { get; set; }

        public bool UploadLater { get; set; }

        public DateTime UploadDate { get; set; }

    }

}