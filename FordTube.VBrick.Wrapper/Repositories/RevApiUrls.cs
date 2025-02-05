// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Repositories
{

    public class RevApiUrls
    {

        public RevApiUrls(string baseUrl) { BaseUrl = baseUrl; }


        private string BaseUrl { get; }

        public string ApiAuthenticate => BaseUrl + "/api/v2/authenticate";

        public string ApiExtendSession => BaseUrl + "/api/v2/auth/extend-session-timeout/{0}";

        public string LoginUrl => BaseUrl + "/api/v2/user/login";

        public string LogoffUrl => BaseUrl + "/api/v2/user/logoff";

        public string UploadVideoUrl => BaseUrl + "/api/v2/uploads/videos";

        public string ReplaceVideoUrl => BaseUrl + "/api/uploads/videos/{0}";

        public string AllVideosUrl => BaseUrl + "/api/v2/videos?Authorization={0}";

        public string VideoPlaybackUrl => BaseUrl + "/api/v2/videos/{0}/playback-url";

        public string ExtendSessionUrl => BaseUrl + "/api/v2/user/extend-session-timeout";

        public string AddUserUrl => BaseUrl + "/api/v2/users";

        public string DeleteUserUrl => BaseUrl + "/api/v2/users/{0}";

        public string UserUrl => BaseUrl + "/api/v2/users/{0}";

        public string UserByUserNameUrl => BaseUrl + "/api/v2/users/{0}?type=username";

        public string UserByEmailUrl => BaseUrl + "/api/v2/users/{0}?type=email";

        public string RolesUrl => BaseUrl + "/api/v2/users/roles";

        public string CheckSessionUrl => BaseUrl + "/api/v2/user/session";

        public string CategoriesUrl => BaseUrl + "/api/v2/categories";

        public string AddCategoryUrl => BaseUrl + "/api/v2/categories";

        public string DeleteCategoryUrl => BaseUrl + "/api/v2/categories/{0}";

        public string UploadSupplimentalFilesUrl => BaseUrl + "/api/v2/uploads/supplemental-files/{0}";

        public string GetSupplimentalFilesUrl => BaseUrl + "/api/v2/videos/{0}/supplemental-files";
       
        public string DownloadSupplimentalFilesUrl => BaseUrl + "/api/v2/videos/{0}/supplemental-files/{1}";

        public string UploadTranscriptionFile => BaseUrl + "/api/uploads/transcription-files/{0}";

        public string UploadThumbnailUrl => BaseUrl + "/api/uploads/images/{0}";

        public string VideoStatusUrl => BaseUrl + "/api/v2/videos/{0}/status";

        public string VideoMigrationUrl => BaseUrl + "/api/v2/videos/{0}/migration";

        public string VideoDetailsUrl => BaseUrl + "/api/v2/videos/{0}/details";

        public string VideoStatisticsSummary => BaseUrl + "/api/v2/videos/{0}/summary-statistics";

        public string EditVideoDetailsUrl => BaseUrl + "/api/v2/videos/{0}";

        public string EditVideoRatingUrl => BaseUrl + "/api/v2/videos/{0}/rating";

        public string DeleteVideoUrl => BaseUrl + "/api/v2/videos/{0}";

        public string AddCommentUrl => BaseUrl + "/api/v2/videos/{0}/comment";

        public string EditVideoAccessUrl => BaseUrl + "/api/v2/videos/{0}/access-control";

        public string SearchVideoUrl => BaseUrl + "/api/v2/videos/search";

        public string UploadVideoByUrl => BaseUrl + "/api/v2/videos";

        public string DownloadVideoUrl => BaseUrl + "/api/v2/videos/{0}/download";

        public string VideoViewStatusUrl => BaseUrl + "/api/v2/videos/{0}/users/{1}/status";

        public string VideoCommentsUrl => BaseUrl + "/api/v2/videos/{0}/comments";

        public string VideoEmbedingUrls => BaseUrl + "/api/v2/oembed";

        public string VideoReportUrl => BaseUrl + "/api/v2/videos/report";

        public string ApprovalTemplatesUrl => BaseUrl + "/api/v2/videos/approval/templates";

        public string SendVideoForApprovalUrl => BaseUrl + "/api/v2/videos/{0}/approval/submitted/{1}";

        public string ApproveVideoUrl => BaseUrl + "/api/v2/videos/{0}/approval/approved";

        public string RejectVideoUrl => BaseUrl + "/api/v2/videos/{0}/approval/rejected";

        public string PendingVideosUrl => BaseUrl + "/api/v2/videos/approval/pending";

        public string ScheduledEventsUrl => BaseUrl + "/api/v2/scheduled-events";

        public string ScheduledEventsSearchUrl => BaseUrl + "/api/v2/search/scheduled-events";

        public string CreateScheduledEventUrl => BaseUrl + "/api/v2/scheduled-events";

        public string GetScheduledEventUrl => BaseUrl + "/api/v2/scheduled-events/{0}";

        public string EditScheduledEventUrl => BaseUrl + "/api/v2/scheduled-events/{0}";

        public string EditEventAccessUrl => BaseUrl + "/api/v2/scheduled-events/{0}/access-control";

        public string EventReportUrl => BaseUrl + "/api/v2/scheduled-events/{0}/report";

        public string DmeDevicesUrl => BaseUrl + "/api/v2/devices/dmes";

        public string AddDmeUrl => BaseUrl + "/api/v2/devices/dmes";

        public string DeleteDmeUrl => BaseUrl + "/api/v2/devices/dmes/{0}";

        public string ProsentationProfilesUrl => BaseUrl + "/api/v2/presentation-profiles";

        public string AccessEntitiesUrl => BaseUrl + "/api/v2/search/access-entity";

        public string AccessEntitiesQueryUrl => BaseUrl + "/api/v2/search/access-entity?q={0}&type={1}";

        public string VideoFieldsUrl => BaseUrl + "/api/v2/video-fields";

        public string GetTeamsUrl => BaseUrl + "/api/v2/teams";

        public string AddTeamUrl => BaseUrl + "/api/v2/teams";

        public string DeleteTeamUrl => BaseUrl + "/api/v2/teams/{0}";

        public string EditTeamUrl => BaseUrl + "/api/v2/teams/{0}";

        public string SearchTeamsUrl => BaseUrl + "/api/v2/search/teams";

        public string AddGroupUrl => BaseUrl + "/api/v2/groups";

        public string DeleteGroupUrl => BaseUrl + "/api/v2/groups/{0}";

        public string EditGroupUrl => BaseUrl + "/api/v2/groups/{0}";

        public string SearchGroupUrl => BaseUrl + "/api/v2/search/groups/{0}/users";

        public string ZonesUrl => BaseUrl + "/api/v2/zones";

        public string AddZoneUrl => BaseUrl + "/api/v2/zones";

        public string DeleteZoneUrl => BaseUrl + "/api/v2/zones/{0}";

        public string EditZoneUrl => BaseUrl + "/api/v2/zones/{0}";

        public string ZoneDevicesUrl => BaseUrl + "/api/v2/zonedevices";

        public string StartRecordingUrl => BaseUrl + "/api/v2/vc/start-recording";

        public string StopRecordingUrl => BaseUrl + "/api/v2/vc/stop-recording";

        public string RecordingStatusUrl => BaseUrl + "/api/v2/vc/recording-status/{0}";

        public string GetPlaylistsUrl => BaseUrl + "/api/v2/playlists";

        public string AddPlaylistUrl => BaseUrl + "/api/v2/playlists";

        public string ManageFeaturedListUrl => BaseUrl + "/api/v2/playlists/featured-playlist";

        public string DeletePlaylistUrl => BaseUrl + "/api/v2/playlists/{0}";

        public string ManagePlaylistUrl => BaseUrl + "/api/v2/playlists/{0}";

        public string LoginReport => BaseUrl + "/api/v2/users/login-report";

    }

}