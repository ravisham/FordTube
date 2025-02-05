// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Collections.Generic;
using System.Text;
using FordTube.VBrick.Wrapper.Enums;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoSearchRequestModel
    {

        public VideoType Type { get; set; } = VideoType.All;

        public List<string> Categories { get; set; } = new List<string>();

        public List<string> Uploaders { get; set; } = new List<string>();

        public List<string> UploaderIds { get; set; } = new List<string>();

        public VideoStatus Status { get; set; } = VideoStatus.Active;

        public string Query { get; set; }

        public int Count { get; set; } = 50;

        public bool TitleOnly { get; set; } = false;

        public DateTime? FromPublishedDate { get; set; }

        public DateTime? ToPublishedDate { get; set; }

        public DateTime? FromUploadDate { get; set; }

        public DateTime? ToUploadDate { get; set; }


        public DateTime? FromModifiedDate { get; set; }

        public DateTime? ToModifiedDate { get; set; }

        public string ScrollId { get; set; }

        public SortFieldType SortField { get; set; } = SortFieldType.Title;

        public SortDirectionType SortDirection { get; set; } = SortDirectionType.Asc;

        public bool ExactMatch { get; set; } = false;

        public SearchFieldType SearchField { get; set; }


        public override string ToString()
        {
            var result = new StringBuilder("?sortDirection=");
            result.Append(SortDirection.ToString().ToLower());

            if (SortField != SortFieldType.Title)
            {
                result.Append("&sortField=");
                result.Append(char.ToLowerInvariant(SortField.ToString()[0]) + SortField.ToString().Substring(1));
            }
            else
            {
                if (SortDirection == SortDirectionType.Desc && !string.IsNullOrEmpty(Query)) { result.Append("&sortField=_score"); }
            }

            result.Append("&titleOnly=");
            result.Append(TitleOnly.ToString().ToLower());

            if (!string.IsNullOrEmpty(ScrollId))
            {
                result.Append("&scrollId=");
                result.Append(ScrollId);
            }

            result.Append("&count=");
            result.Append(Count);

            if (!string.IsNullOrEmpty(Query))
            {
                result.Append("&q=");
                result.Append(Query);
            }

            if (Status != VideoStatus.All)
            {
                result.Append("&status=");
                result.Append(Status.ToString().ToLower());
            }

            if (UploaderIds.Count > 0)
            {
                result.Append("&uploaderIds=");
                result.Append(string.Join(",", UploaderIds.ToArray()));
            }

            if (Uploaders.Count > 0)
            {
                result.Append("&uploaders=");
                result.Append(string.Join(",", Uploaders.ToArray()));
            }

            if (Categories.Count > 0)
            {
                result.Append("&categories=");
                result.Append(string.Join(",", Categories.ToArray()));
            }

            if (Type != VideoType.All)
            {
                result.Append("&type=");
                result.Append(Type.ToString().ToLower());
            }

            if (FromPublishedDate.HasValue)
            {
                result.Append("&fromPublishedDate=");
                result.Append(TransformDateToRevString(FromPublishedDate));
            }

            if (ToPublishedDate.HasValue)
            {
                result.Append("&toPublishedDate=");
                result.Append(TransformDateToRevString(ToPublishedDate, true));
            }

            if (FromUploadDate.HasValue)
            {
                result.Append("&fromUploadDate=");
                result.Append(TransformDateToRevString(FromUploadDate));
            }

            if (ToUploadDate.HasValue)
            {
                result.Append("&toUploadDate=");
                result.Append(TransformDateToRevString(ToUploadDate, true));
            }

            if (FromModifiedDate.HasValue)
            {
                result.Append("&fromModifiedDate=");
                result.Append(TransformDateToRevString(FromModifiedDate));
            }

            if (ToModifiedDate.HasValue)
            {
                result.Append("&toModifiedDate=");
                result.Append(TransformDateToRevString(ToModifiedDate, true));
            }

            if (SearchField != SearchFieldType.All)
            {
                result.Append("&searchField=");
                result.Append(SearchField.ToString().ToLower());
            }

            if (ExactMatch) { result.Append("&exactMatch=true"); }

            return result.ToString();
        }


        private static string TransformDateToRevString(DateTime? date, bool setEndOfDay = false)
        {
            if (date != null)
            {
                return setEndOfDay ? date.Value.Date.AddDays(1).ToString("u").Replace(' ', 'T') : date.Value.Date.ToString("u").Replace(' ', 'T');
            }
            return string.Empty;
        }

    }

}