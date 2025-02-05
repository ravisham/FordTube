using FordTube.VBrick.Wrapper.Enums;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class VideoDetailsModel
    {

        public decimal? RatingByUser { get; set; }

        public string Id { get; set; }

        public decimal Rating { get; set; }

        public int? TotalRatings { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string ThumbnailUrl { get; set; }

        public LinkedUrlModel LinkedUrl { get; set; }

        public List<string> Categories { get; set; }

        public List<string> Tags { get; set; }

        public bool IsActive { get; set; }

        public string ApprovalStatus { get; set; }

        public bool EnableRatings { get; set; }

        public bool EnableDownloads { get; set; }

        public bool EnableComments { get; set; }

        public string VideoAccessControl { get; set; }

        public string Password { get; set; }

        public string Status { get; set; }

        public bool CanEdit { get; set; }

        public AccessControlEntityModel[] AccessControlEntities { get; set; }

        public CustomFieldDetailsModel[] CustomFields { get; set; }

        [JsonProperty(PropertyName = "expirationDate")]
        public string EDate { get; set; }


        [JsonIgnoreAttribute]
        public DateTime? ExpirationDate
        {
            get
            {
                if (!string.IsNullOrEmpty(EDate)) { return DateTime.Parse(EDate); }
                else { return null; }
            }
            set
            {
                if (value.HasValue) { EDate = value.Value.ToString("yyyy-MM-dd"); }
                else { EDate                = null; }
            }
        }


        public string ExpirationAction { get; set; }

        public string UploadedBy { get; set; }

        public DateTime? WhenUploaded { get; set; }

        public string HtmlDescription { get; set; }

        [JsonProperty(PropertyName = "publishDate")]
        public string PDate { get; set; }


        [JsonIgnoreAttribute]
        public DateTime? PublishDate
        {
            get
            {
                if (!string.IsNullOrEmpty(PDate)) { return DateTime.Parse(PDate); }
                else { return null; }
            }
            set
            {
                if (value.HasValue) { PDate = value.Value.ToString("yyyy-MM-dd"); }
                else { PDate                = null; }
            }
        }


        public CategoryPathModel[] CategoryPaths { get; set; }

        public string SourceType { get; set; }

        public bool Archived { get; set; }

        public bool Flagged { get; set; }

       // public List<AttachedFileModel> Files { get; set; }

        public List<SupplementalFileModel> SupplementalFiles { get; set; }       

        public FranchiseType Franchise { get; set; }

        public bool IsDealer { get; set; }

        public string BusinessOwnerName { get; set; }

        public string BusinessOwnerEmail { get; set; }

        public string ContactsName { get; set; }

        public string ContactsEmail { get; set; }

        public string Notes { get; set; }

        public bool IsOfficial { get; set; }

        public bool IsRejected { get; set; }

        public bool IsPendingApproval { get; set; }

        public bool IsAdmin { get; set; }

        public bool Is360 { get; set; }

        public int TotalViews { get; set; }

        public string SrtFileName { get; set; } = "";

        public List<string> RestrictionCategories { get; set; }

    }

}