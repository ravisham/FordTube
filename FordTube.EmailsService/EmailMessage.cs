namespace FordTube.EmailsService
{
    public enum CustomKeys
    {
        VideoRequestHasBeenReceived = 894937,
        VideoHasBeenPublished = 894936,
        NewComment = 894934,
        VideoIsAboutToExpire = 894076
    }
    public class EmailMessage
    {
        internal string Subject { get; set; } = "";
        public string ToEmail { get; set; } = "";
        internal string FromEmail { get; set; } = "noreply@email-fordtube.com";
        internal string FromName { get; set; } = "Ford Tube Admin";
        public CustomKeys CustomerKey { get; set; }
        internal string StatusMessage { get; set; } = "";
        internal string eCert { get; set; } = "";
        internal string CustName { get; set; } = "";
        internal string Address { get; set; } = "";
        internal string Address2 { get; set; } = "";
        internal string ExpDate { get; set; } = "";
        internal string VIN { get; set; } = "";
        internal string Phone { get; set; } = "";
        public string VideoTitle { get; set; } = "";
        public string VideoLink { get; set; } = "";
        internal string Param3 { get; set; } = "";
        public string Comment { get; set; } = "";
        public string VideoLink2 { get; set; } = "";
        internal string Param6 { get; set; } = "";
        internal string Param7 { get; set; } = "";
        internal string Param8 { get; set; } = "";
        internal string Param9 { get; set; } = "";
        internal string Param10 { get; set; } = "";
        internal string BccEmail { get; set; } = "fordtube@ford.com";
        public string CcEmail { get; set; } = "";
    }
}
