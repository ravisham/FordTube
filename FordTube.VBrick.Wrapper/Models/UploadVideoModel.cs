using FordTube.VBrick.Wrapper.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace FordTube.VBrick.Wrapper.Models
{
    public class UploadVideoModel
    {

        public string Title { get; set; }

        public string Description { get; set; }

        public string FileName { get; set; }

        public byte[] Data { get; set; }

        public string[] Tags { get; set; }

        public string Uploader { get; set; }

        public string[] Categories { get; set; }

        public VideoAccessControlType? VideoAccessControl { get; set; }

        public AccessControlEntityModel[] AccessControlEntities { get; set; }

        public bool EnableDownloads { get; set; }

        public DateTime? ExpirationDate { get; set; }
        
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime? PublishDate { get; set; }

        public string[] FranchiseCategories { get; set; }

        public bool Placeholder { get; set; }

        public string BusinessOwnerName { get; set; }

        public string BusinessOwnerEmail { get; set; }

        public string ContactsName { get; set; }

        public string ContactsEmail { get; set; }

        public bool PartOfSeries { get; set; }

        public string Notes { get; set; }

        public bool Is360 { get; set; }

        public string SrtFileName { get; set; }
    }
}