using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

using FordTube.VBrick.Wrapper.Enums;
using FordTube.VBrick.Wrapper.Http.Client;
using FordTube.VBrick.Wrapper.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Configuration;

using Newtonsoft.Json;

using OneMagnify.Common.Extensions;
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Repositories;

using File = System.IO.File;


namespace FordTube.VBrick.Wrapper.Repositories {

    public class VBrickApiRepository : IVBrickApiRepository {

        public VBrickApiRepository(IVbrickMappingRepository mappingRepository, IHttpContextAccessor httpAccessor, IConfiguration configuration, IRevApiClient revApiClient)
        {
            _mappingRepository = mappingRepository;
            _httpAccessor = httpAccessor;
            _revApiClient = revApiClient;
            VbrickApiEndpoints = new RevApiUrls(configuration.GetSection("VBrickSettings:BaseUrl").Value);
        }


        private const string FranchiseHeaderName = "franchise";


        private readonly IHttpContextAccessor _httpAccessor;


        private readonly IRevApiClient _revApiClient;


        private readonly IVbrickMappingRepository _mappingRepository;


        private List<VbrickMapping> MappedObjects { get; set; }


        private FranchiseType RequestScopeFranchise { get; set; }


        private RevApiUrls VbrickApiEndpoints { get; }


        public FranchiseType Franchise { get => RequestScopeFranchise; set => RequestScopeFranchise = value; }


        public async Task ActivateVideo(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            details.IsActive = true;

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);
        }


        public async Task<AddCategoryResponseModel> AddCategory(AddCategoryRequestModel model)
        {
            if (model.ParentCategoryId != null) return await _revApiClient.PostAsync<AddCategoryResponseModel>(VbrickApiEndpoints.AddCategoryUrl, model);

            model.ParentCategoryId = model.Franchise switch
            {
                FranchiseType.Ford    => GetMappedId(VbrickMappingsType.FordId),
                FranchiseType.Lincoln => GetMappedId(VbrickMappingsType.LincolnId),
                _                     => model.ParentCategoryId
            };

            return await _revApiClient.PostAsync<AddCategoryResponseModel>(VbrickApiEndpoints.AddCategoryUrl, model);
        }


        public async Task<string> AddDmeDevice(AddDmeModel model)
        {
            var result = await _revApiClient.PostAsync<AddDmeResponseModel>(VbrickApiEndpoints.AddDmeUrl, model);

            return result?.DeviceId;
        }


        public async Task<AddCategoryResponseModel> AddFeaturedCategory(string name) { return await AddCategory(new AddCategoryRequestModel { Name = name, ParentCategoryId = GetMappedId(VbrickMappingsType.FeaturedId) }); }


        public async Task<string> AddGroup(AddOrEditGroupModel model)
        {
            var result = await _revApiClient.PostAsync<AddGroupResponseModel>(VbrickApiEndpoints.AddGroupUrl, model);

            return result?.GroupId;
        }


        public async Task<string> AddPlaylist(AddPlaylistRequestModel model)
        {
            var result = await _revApiClient.PostAsync<AddPlaylistResponseModel>(VbrickApiEndpoints.AddPlaylistUrl, model);

            return result.PlaylistId;
        }


        public async Task<string> AddTeam(AddTeamModel model)
        {
            var result = await _revApiClient.PostAsync<AddTeamResponseModel>(VbrickApiEndpoints.AddTeamUrl, model);

            return result?.TeamId;
        }


        public async Task<string> AddUser(UserModel model)
        {
            var response = await _revApiClient.PostAsync<LogoffRequestModel>(VbrickApiEndpoints.AddUserUrl, model);

            return response?.UserId;
        }


        public async Task AddVideoComment(string id, AddCommentModel model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.AddCommentUrl, id), new AddCommentRequestModel { Comment = model.Comment, UserName = model.UserName }); }


        public async Task<string> AddZone(AddOrEditZoneModel model)
        {
            var result = await _revApiClient.GetAsync<AddZoneResponseModel>(VbrickApiEndpoints.AddZoneUrl);

            return result?.ZoneId;
        }


        public async Task ApproveVideo(string videoId) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.ApproveVideoUrl, videoId), null); }


        public async Task ApproveVideoRequest(string id, bool approve)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            details.IsActive = approve;

            var fordApprovalCategoryId    = GetMappedId(VbrickMappingsType.FordApprovalCategoryId);
            var lincolnApprovalCategoryId = GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId);

            details.Categories = details.Categories.Where(c => c != fordApprovalCategoryId && c != lincolnApprovalCategoryId).ToList();

            //update publish date to current date to handle videos uploaded with publish date less than or equal to current date
            if (details.PublishDate == null) details.PublishDate = DateTime.Now;

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);

            var model = new MigrationModel { UserName = details.UploadedBy, WhenUploaded = DateTime.Now };

            if (details.IsOfficial) model = new MigrationModel { UserName = GetMappedId(VbrickMappingsType.OfficialUserId), WhenUploaded = DateTime.Now };

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.VideoMigrationUrl, id), model);
        }


        public async Task ArchiveVideo(string id)
        {
            var model = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var archiveId = GetMappedId(VbrickMappingsType.ArchiveId);
            model.Categories.Clear();
            model.Categories.Add(archiveId);

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), model);
        }


        public async Task<bool> CheckPermissions(CheckPermissionsModel model)
        {
            if (!model.IsDealer) return false;

            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, model.VideoId));

            var marketCategoryRequest = new GetCategoriesRequestModel { ParentCategoryId = GetMappedId(VbrickMappingsType.MarketsCategoryId) };

            var marketCategories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl + marketCategoryRequest);

            var roleCategoryRequest = new GetCategoriesRequestModel { ParentCategoryId = GetMappedId(VbrickMappingsType.RolesCategoryId) };

            var roleCategories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl + roleCategoryRequest);

            var roleCategoryId = GetMappedId(RestrictionsMapper.Map(model.Role));

            var roleContains = !details.Categories.Any(c => roleCategories.Categories.Any(rc => rc.CategoryId == c)) || details.Categories.Any(c => c == roleCategoryId);

            bool marketContains;

            if (model.Market == null) return roleContains;
            {
                var marketValue = GetMappedId(RestrictionsMapper.Map(model.Market.Value));
                marketContains = !details.Categories.Any(c => marketCategories.Categories.Any(mc => mc.CategoryId == c)) || details.Categories.Any(c => c == marketValue);
            }

            return roleContains && marketContains;
        }


        public async Task<string> CommentsReport()
        {
            var                      result   = new StringBuilder();
            string                   scrollId = null;
            VideoSearchResponseModel videos;
            var                      count = 0;

            do
            {
                var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 100 };

                videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

                count += videos.Videos.Length;

                foreach (var video in videos.Videos)
                {
                    var commentsModel = await _revApiClient.GetAsync<CommentModel>(string.Format(VbrickApiEndpoints.VideoCommentsUrl, video.Id));

                    foreach (var comment in commentsModel.Comments) result.AppendLine($"{video.Id},{comment.Id},{comment.FirstName},{comment.LastName},{comment.UserName},{comment.IsRemoved},{comment.Date.ToString(CultureInfo.InvariantCulture)},{comment.Text}");
                }

                scrollId = videos.ScrollId;
            } while (videos.TotalVideos > count);

            return result.ToString();
        }


        public async Task CreateEvent(CreateEventModel model) { await _revApiClient.PostAsync(VbrickApiEndpoints.CreateScheduledEventUrl, model); }


        public async Task DeleteCategory(string id) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteCategoryUrl, id)); }


        public async Task DeleteDme(string deviceId) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteDmeUrl, deviceId)); }


        public async Task DeleteGroup(string groupId) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteGroupUrl, groupId)); }


        public async Task DeletePlaylist(string id) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeletePlaylistUrl, id)); }


        public async Task DeleteTeam(string teamId) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteTeamUrl, teamId)); }


        public async Task DeleteUser(string id) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteUserUrl, id)); }


        public async Task DeleteVideo(string id) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteVideoUrl, id)); }


        public async Task DeleteVideoRequest(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var fordApprovalCategoryId    = GetMappedId(VbrickMappingsType.FordApprovalCategoryId);
            var lincolnApprovalCategoryId = GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId);

            details.Categories = details.Categories.Where(c => c != fordApprovalCategoryId && c != lincolnApprovalCategoryId).ToList();

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);
        }


        public async Task DeleteZone(string zoneId) { await _revApiClient.DeleteAsync(string.Format(VbrickApiEndpoints.DeleteZoneUrl, zoneId)); }


        public async Task<byte[]> DownloadVideo(string id) { return await _revApiClient.DownloadAsync(string.Format(VbrickApiEndpoints.DownloadVideoUrl, id)); }


        public async Task<Stream> DownloadFileStream(string url) { return await _revApiClient.DownloadFileAsync(url); }


        public async Task EditAccessControl(string id, AccessControlEntityModel[] model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoAccessUrl, id), model); }


        public async Task EditEvent(string eventId, EditEventModel model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditScheduledEventUrl, eventId), model); }


        public async Task EditEventAccess(string eventId, EditEventAccessControlModel model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditEventAccessUrl, eventId), model); }


        public async Task EditGroup(string groupId, AddOrEditGroupModel model) { await _revApiClient.PostAsync(string.Format(VbrickApiEndpoints.EditGroupUrl, groupId), model); }


        public async Task EditTeam(string teamId, AddTeamModel model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditTeamUrl, teamId), model); }


        public async Task EditVideoDetails(EditVideoModel model, bool videoFileReplaced)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, model.Id));

            var detailsDate = details.PublishDate;
            details.Title = model.Title;
            details.Description = model.Description;
            details.Tags = model.Tags;
            details.Id = model.Id;

            if (details.IsActive)
            {
                if (videoFileReplaced && details.Categories.Contains(GetMappedId(VbrickMappingsType.OfficialCategoryId)))
                {
                    details.IsActive = false;
                    var fordId = GetMappedId(VbrickMappingsType.FordId);

                    if (details.Categories.Any(c => c == fordId)) details.Categories.Add(GetMappedId(VbrickMappingsType.FordApprovalCategoryId));

                    var lincolnId = GetMappedId(VbrickMappingsType.LincolnId);

                    if (details.Categories.Any(c => c == lincolnId)) details.Categories.Add(GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId));
                }

                if (details.IsActive) details.IsActive = model.PublishDate != null && model.PublishDate.Value.Date <= DateTime.Now.Date;
            }

            details.PublishDate = model.PublishDate != null && model.PublishDate.Value.Date >= DateTime.Now.Date ? model.PublishDate : details.PublishDate;

            if (model.ExpirationDate != null) details.ExpirationDate = model.ExpirationDate != null && model.ExpirationDate.Value.Date > DateTime.Now.Date || model.ExpirationDate == details.ExpirationDate && details.ExpirationDate != null ? model.ExpirationDate.Value : DateTime.Now.AddYears(1);

            var categories          = details.CategoryPaths.ToList();
            var result              = new List<CategoryPathModel>();
            var fordCategoryName    = GetMappedId(VbrickMappingsType.FordCategoryName);
            var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);
            result.AddRange(categories.Where(c => c.FullPath.Contains(fordCategoryName    + "/")).ToList());
            result.AddRange(categories.Where(c => c.FullPath.Contains(lincolnCategoryName + "/")).ToList());
            var restrictionCategoryRequest = new GetCategoriesRequestModel { ParentCategoryId = GetMappedId(VbrickMappingsType.RestrictionsCategoryId) };

            var restrictionCategories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl + restrictionCategoryRequest);

            var restrictionsCategoryId = GetMappedId(VbrickMappingsType.RestrictionsCategoryId);

            result.AddRange(categories.Where(c => restrictionCategories.Categories.Any(r => r.CategoryId == c.CategoryId) || c.CategoryId == restrictionsCategoryId).ToList());

            details.Categories = details.Categories.Where(c => result.All(r => r.CategoryId != c)).ToList();
            details.Categories.AddRange(model.Categories);

            if (model.AccessControlEntities.Length > 0)
            {
                details.Categories.AddRange(model.AccessControlEntities.Select(c => c.Id));
                details.Categories.Add(GetMappedId(VbrickMappingsType.RestrictionsCategoryId));

                if (details.AccessControlEntities != model.AccessControlEntities && model.AccessControlEntities.Length > 0) details.AccessControlEntities = model.AccessControlEntities;
            }
            details.AccessControlEntities = null;

            var ownerNameId        = GetMappedId(VbrickMappingsType.OwnerNameId);
            var ownerEmailId       = GetMappedId(VbrickMappingsType.OwnerEmailId);
            var contactNameId      = GetMappedId(VbrickMappingsType.ContactsNameId);
            var contactEmailId     = GetMappedId(VbrickMappingsType.ContactsEmailId);
            var notesFieldId       = GetMappedId(VbrickMappingsType.NotesFieldId);
            var strFileNameFieldId = GetMappedId(VbrickMappingsType.SrtFileNameFieldId);
            var uploaderId         = GetMappedId(VbrickMappingsType.UploaderID);

            details.EnableDownloads = model.EnableDownloads;
            details.CustomFields.First(f => f.Id == ownerNameId).Value = model.BusinessOwnerName;
            details.CustomFields.First(f => f.Id == ownerEmailId).Value = model.BusinessOwnerEmail;
            details.CustomFields.First(f => f.Id == contactNameId).Value = model.ContactsName;
            details.CustomFields.First(f => f.Id == contactEmailId).Value = model.ContactsEmail;
            details.CustomFields.First(f => f.Id == notesFieldId).Value = model.Notes;

            if (!string.IsNullOrEmpty(model.SrtFileName)) details.CustomFields.First(f => f.Id == strFileNameFieldId).Value = model.SrtFileName;

            if (model.PublishDate != null && model.PublishDate != detailsDate)
            {
                var userField = details.CustomFields.FirstOrDefault(c => c.Id == uploaderId);

                if (userField?.Value == "") await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, model.Id), details);

                var easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");

                if (details.PublishDate == null) await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, model.Id), details);

                // ReSharper disable once PossibleInvalidOperationException
                var easternTime = TimeZoneInfo.ConvertTimeFromUtc(details.PublishDate.Value, easternZone);

                await VideoMigration(model.Id, new MigrationModel { UserName = userField?.Value, WhenUploaded = easternTime });
            }

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, model.Id), details);
        }


        public async Task EditVideoExpirationDate(string id, UploadVideoModel model)
        {
            model.ExpirationDate ??= DateTime.Now.AddYears(1);

            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            if (model.ExpirationDate.Value.Date > DateTime.Now.Date)
            {
                details.ExpirationDate = model.ExpirationDate.Value;
                details.ExpirationAction = "Inactivate";
            }

            DateTime? publishDate = null;

            if (model.PublishDate != null && model.PublishDate.Value.Date >= DateTime.Now.Date)
            {
                details.PublishDate = model.PublishDate;
                publishDate = model.PublishDate;
                details.IsActive = model.PublishDate.Value.Date == DateTime.Now.Date && !details.Categories.Contains(GetMappedId(RequestScopeFranchise == FranchiseType.Ford ? VbrickMappingsType.FordApprovalCategoryId : VbrickMappingsType.LincolnApprovalCategoryId));
            }

            if (publishDate != null && publishDate.Value.Date > DateTime.Now.Date)
                if (details.WhenUploaded != null)
                {
                    var whenUpload = new DateTime(publishDate.Value.Year, publishDate.Value.Month, publishDate.Value.Day, details.WhenUploaded.Value.Hour, details.WhenUploaded.Value.Minute, 0);

                    await VideoMigration(id, new MigrationModel { UserName = model.Uploader, WhenUploaded = whenUpload });

                    details.WhenUploaded = whenUpload;
                }

            var uploadDateFieldId = GetMappedId(VbrickMappingsType.UploadDateFieldId);
            var uploadDateField   = details.CustomFields.FirstOrDefault(c => c.Id == uploadDateFieldId);

            if (uploadDateField != null)
            {
                var easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");

                if (details.WhenUploaded != null)
                {
                    var easternTime = TimeZoneInfo.ConvertTimeFromUtc(details.WhenUploaded.Value, easternZone);
                    uploadDateField.Value = easternTime.ToString(CultureInfo.InvariantCulture);
                }
            }

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);
        }


        public async Task EditVideoRating(string id, EditRatingModel model)
        {
            var editVideoModel = new EditRatingModel()
            {
                VideoId = id,
                Rating = model.Rating,
            };

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoRatingUrl, id), editVideoModel);
        }


        public async Task EditZone(string zoneId, AddOrEditZoneModel model) { await _revApiClient.PostAsync(string.Format(VbrickApiEndpoints.EditZoneUrl, zoneId), model); }


        public async Task FlagVideo(string id)
        {
            var model = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var archiveId = GetMappedId(RequestScopeFranchise == FranchiseType.Lincoln ? VbrickMappingsType.LincolnFlaggedId : VbrickMappingsType.FordFlaggedId);

            if (model.Categories.Contains(archiveId)) return;

            model.Categories.Add(archiveId);

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), model);
        }


        public async Task<AccessEntitiesModel> GetAccessEntities() { return await _revApiClient.GetAsync<AccessEntitiesModel>(VbrickApiEndpoints.AccessEntitiesUrl); }


        public async Task<VideoSearchResponseModel> GetAllVideoRequests(string scrollId)
        {
            var model = new VideoSearchRequestModel
            {
                ScrollId = scrollId,
                Count = 50,
                Status = VideoStatus.All,
                SortDirection = SortDirectionType.Desc,
                SortField = SortFieldType.WhenUploaded
            };

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both) model.Categories.Add(GetMappedId(VbrickMappingsType.FordId));

            if (RequestScopeFranchise == FranchiseType.Lincoln || RequestScopeFranchise == FranchiseType.Both) model.Categories.Add(GetMappedId(VbrickMappingsType.LincolnId));

            var result = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            foreach (var video in result.Videos) video.PartOfSeries = video.Categories.Contains(GetMappedId(VbrickMappingsType.PartOfSeriesId));

            return result;
        }


        public async Task<ApprovalTemplateModel[]> GetApprovalTemplates() { return await _revApiClient.GetAsync<ApprovalTemplateModel[]>(VbrickApiEndpoints.ApprovalTemplatesUrl); }


        public async Task<VideoSearchResponseModel> GetArchivedVideos(string scrollId)
        {
            var franchiseCategoryIds = new List<string> { GetMappedId(VbrickMappingsType.ArchiveId) };

            var model = new VideoSearchRequestModel
            {
                UploaderIds = new List<string>(),
                Uploaders = new List<string>(),
                Categories = franchiseCategoryIds,
                Count = 50,
                ScrollId = scrollId == "" ? null : scrollId,
                SortField = SortFieldType.WhenUploaded,
                SortDirection = SortDirectionType.Asc
            };

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);
        }


        public async Task<GetCategoriesModel> GetCategories() { return await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl); }


        public async Task<GetCategoryModel[]> GetCategoriesByFranchise(FranchiseType franchise)
        {
            var categoriesList = new List<GetCategoryModel>();
            var categories     = await GetCategories();

            switch (franchise)
            {
                case FranchiseType.Ford:
                {
                    var fordCategoryName = GetMappedId(VbrickMappingsType.FordCategoryName);
                    categoriesList.AddRange(categories.Categories.Where(c => c.Fullpath.Contains(fordCategoryName + "/")).ToList());

                    categoriesList.ForEach(c => c.Fullpath = c.Fullpath.Replace(fordCategoryName + "/", ""));

                    break;
                }

                case FranchiseType.Lincoln:
                {
                    var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);
                    categoriesList.AddRange(categories.Categories.Where(c => c.Fullpath.Contains(lincolnCategoryName + "/")).ToList());

                    categoriesList.ForEach(c => c.Fullpath = c.Fullpath.Replace(lincolnCategoryName + "/", ""));

                    break;
                }

                default:
                {
                    var fordCategoryName    = GetMappedId(VbrickMappingsType.FordCategoryName);
                    var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);

                    categoriesList.AddRange(categories.Categories.Where(c => c.Fullpath.Contains(fordCategoryName + "/") || c.Fullpath.Contains(lincolnCategoryName + "/")).ToList());

                    categoriesList.ForEach(c => c.Fullpath = c.Fullpath.Replace(lincolnCategoryName + "/", "").Replace(fordCategoryName + "/", ""));

                    break;
                }
            }

            return categoriesList.ToArray();
        }


        public async Task<GetCategoriesModel> GetChildrenCategories(string id)
        {
            var model          = await FilterCategories();
            var parentCategory = model.Categories.FirstOrDefault(c => c.CategoryId == id);

            if (parentCategory == null) return model;
            {
                var filteredCategories = model.Categories.Where(c => c.Fullpath.Contains(parentCategory.Fullpath + "/") || c.Fullpath == parentCategory.Fullpath).OrderBy(c => c.Fullpath.Length).ToList();

                model.Categories = filteredCategories.ToArray();
            }

            return model;
        }


        public async Task<DmeDevicesModel> GetDmeDevices() { return await _revApiClient.GetAsync<DmeDevicesModel>(VbrickApiEndpoints.DmeDevicesUrl); }


        public async Task<EventDetailsModel> GetEvent(string eventId) { return await _revApiClient.GetAsync<EventDetailsModel>(string.Format(VbrickApiEndpoints.GetScheduledEventUrl, eventId)); }


        public async Task<EventReportModel> GetEventReport(string eventId) { return await _revApiClient.GetAsync<EventReportModel>(string.Format(VbrickApiEndpoints.EventReportUrl, eventId)); }


        public async Task<EventSearchResponseModel> GetEvents(EventsQueryModel model)
        {
            return await _revApiClient.PostAsync<EventSearchResponseModel>(VbrickApiEndpoints.ScheduledEventsSearchUrl, model);
        }

        public async Task<VideoSearchResponseModel> GetExpiredVideos(string scrollId) { return await SearchVideo(new VideoSearchRequestModel { Categories = new List<string> { GetMappedId(VbrickMappingsType.ExpiredId) }, Count = 50, ScrollId = scrollId }); }


        public async Task<FeateredCategoriesModel[]> GetFeaturedCategories()
        {
            var featuredCategoryName = RequestScopeFranchise switch
            {
                FranchiseType.Ford    => GetMappedId(VbrickMappingsType.FeaturedName),
                FranchiseType.Lincoln => GetMappedId(VbrickMappingsType.FeaturedLincolnName),
                _                     => ""
            };

            var categories = await GetCategories();

            var featuredCategories = categories.Categories.Where(c => c.Fullpath.Contains(featuredCategoryName + "/")).Select(m => new FeateredCategoriesModel { Id = m.CategoryId, Name = m.Name }).ToList();

            var model  = new VideoSearchRequestModel { Categories = featuredCategories.Select(c => c.Id).ToList() };
            var videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            featuredCategories.ForEach(c => { c.VideosCount = videos.Videos.Count(v => v.Categories.ToList().Contains(c.Id)); });

            return featuredCategories.ToArray();
        }


        public async Task<VideoSearchResponseModel> GetFeaturedVideos(FeaturedVideosRequestModel model)
        {
            var searchModel = new VideoSearchRequestModel
            {
                Categories = model.Categories.ToList(),
                Count = model.Count,
                ScrollId = model.ScrollId,
                Query = model.Query
            };

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + searchModel);
        }


        public async Task<GetCategoriesModel> GetFilteredCategories() { return await FilterCategories(); }


        public async Task<VideoSearchResponseModel> GetFlaggedVideos(string scrollId)
        {
            var model = new VideoSearchRequestModel
            {
                UploaderIds = new List<string>(),
                Uploaders = new List<string>(),
                Categories = new List<string> { GetMappedId(RequestScopeFranchise == FranchiseType.Lincoln ? VbrickMappingsType.LincolnFlaggedId : VbrickMappingsType.FordFlaggedId) },
                Count = 50,
                ScrollId = scrollId == "" ? null : scrollId,
                SortField = SortFieldType.WhenUploaded,
                SortDirection = SortDirectionType.Asc
            };

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);
        }


        public async Task<FranchiseType> GetFranchise(string[] categories)
        {
            var vbrickCategories    = await GetCategories();
            var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);
            var fordCategoryName    = GetMappedId(VbrickMappingsType.FordCategoryName);
            var ford                = vbrickCategories.Categories.Any(c => c.Fullpath.Contains(fordCategoryName + "/") && categories.Contains(c.CategoryId));

            var lincoln = vbrickCategories.Categories.Any(c => c.Fullpath.Contains(lincolnCategoryName + "/") && categories.Contains(c.CategoryId));

            if (ford && lincoln) return FranchiseType.Both;

            return lincoln ? FranchiseType.Lincoln : FranchiseType.Ford;
        }


        public List<CategoryModel> GetFranchiseCategoriesAsync()
        {
            var result = new List<CategoryModel>
            {
                new CategoryModel { CategoryId = "both", Name = "Both", FullPath = "Both" },
                new CategoryModel { CategoryId = GetMappedId(VbrickMappingsType.FordId), Name = "Ford", FullPath = "Ford" },
                new CategoryModel { CategoryId = GetMappedId(VbrickMappingsType.LincolnId), Name = "Lincoln", FullPath = "Lincoln" }
            };

            return result.ToList();
        }


        public async Task<HomePageCategoryModel[][]> GetHomePageCategories()
        {
            var categories = await FilterCategories();
            var resultList = new List<HomePageCategoryModel>();
            var number     = 0;

            var categoriesList = new Dictionary<string, int> { { "Product & Technology", 1 }, { "Parts & Service", 2 }, { "Executive Communications", 3 } };

            foreach (var c in categories.Categories.Where(c => categoriesList.ContainsKey(c.Name)))
            {
                number++;

                var model = new VideoSearchRequestModel
                {
                    Categories = new List<string> { c.CategoryId },
                    SortField = SortFieldType.WhenUploaded,
                    SortDirection = SortDirectionType.Desc,
                    Count = 3,
                    Status = VideoStatus.Active
                };

                var videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

                if (videos.Videos.Any(v => !string.IsNullOrEmpty(v.ThumbnailUrl))) resultList.Add(new HomePageCategoryModel { Category = c, Video = videos.Videos.FirstOrDefault(v => !string.IsNullOrEmpty(v.ThumbnailUrl)) });

                if (number == 3) break;
            }

            return new[] { resultList.ToArray() };
        }


        public string GetMappedId(VbrickMappingsType name)
        {
            var obj = MappedObjects.FirstOrDefault(m => m.Name == name.ToString());

            return obj == null ? "" : obj.VbrickId;
        }


        public Dictionary<string, string> GetMappings() { return ((VbrickMappingsType[]) Enum.GetValues(typeof(VbrickMappingsType))).ToDictionary(entity => entity.ToString(), GetMappedId); }


        public async Task<UserGroupModel[]> GetMarketCategories()
        {
            var marketCategoryRequest = new GetCategoriesRequestModel { ParentCategoryId = GetMappedId(VbrickMappingsType.MarketsCategoryId) };

            var marketCategories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl + marketCategoryRequest);

            return marketCategories.Categories.Select(c => new UserGroupModel { Id = c.CategoryId, Name = c.Name.Replace(" (DON'T REMOVE)", "") }).OrderBy(g => g.Name).ToArray();
        }


        public async Task<PendingApprovalModel[]> GetPendingVideos() { return await _revApiClient.GetAsync<PendingApprovalModel[]>(VbrickApiEndpoints.PendingVideosUrl); }


        public async Task<VideoSearchResponseModel> GetPendingVideos(string scrollId) { return await SearchVideo(new VideoSearchRequestModel { Categories = new List<string> { GetMappedId(VbrickMappingsType.PendingId) }, Count = 50, ScrollId = scrollId }); }


        public async Task<VideoPlaybackUrlResponseModel> GetPlaybackUrl(string id)
        {
            var categories = await FilterCategories();

            var featuredCategoryName = GetMappedId(VbrickMappingsType.FeaturedName);

            var response = await _revApiClient.GetAsync<VideoPlaybackUrlResponseModel>(string.Format(VbrickApiEndpoints.VideoPlaybackUrl, id));

            if (response != null)
            {
                response.Video.FeaturedCategories = response.Video.Categories.Where(c => c.FullPath.Contains(featuredCategoryName)).Select(c => c.Name).ToList();

                response.Video.Categories = response.Video.Categories.Where(c => !c.FullPath.Contains(featuredCategoryName) && categories.Categories.Any(f => f.CategoryId == c.CategoryId)).ToList();

                var fordCategoryName    = GetMappedId(VbrickMappingsType.FordCategoryName);
                var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);
                response.Video.Categories.ForEach(c => c.FullPath = c.FullPath.Replace(lincolnCategoryName + "/", "").Replace(fordCategoryName + "/", ""));
            }

            return response;
        }


        public async Task<PlaylistDetailsModel> GetPlaylists() { return await _revApiClient.GetAsync<PlaylistDetailsModel>(VbrickApiEndpoints.GetPlaylistsUrl); }


        public async Task<PresentationProfileModel[]> GetPresentationProfiles() { return await _revApiClient.GetAsync<PresentationProfileModel[]>(VbrickApiEndpoints.ProsentationProfilesUrl); }


        public async Task<string> GetRecordingStatus(string videoId)
        {
            var result = await _revApiClient.GetAsync<RecordingStatusModel>(string.Format(VbrickApiEndpoints.RecordingStatusUrl, videoId));

            return result?.Status;
        }


        public async Task<UserGroupModel[]> GetRoleCategories()
        {
            var roleCategoryRequest = new GetCategoriesRequestModel { ParentCategoryId = GetMappedId(VbrickMappingsType.RolesCategoryId) };

            var roleCategories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl + roleCategoryRequest);

            return roleCategories.Categories.Select(c => new UserGroupModel { Id = c.CategoryId, Name = c.Name.Replace(" (DON'T REMOVE)", "") }).OrderBy(g => g.Name).ToArray();
        }


        public async Task<RoleModel[]> GetRoles() { return await _revApiClient.GetAsync<RoleModel[]>(VbrickApiEndpoints.RolesUrl); }


        public async Task<TeamModel[]> GetTeams() { return await _revApiClient.GetAsync<TeamModel[]>(VbrickApiEndpoints.GetTeamsUrl); }


        public async Task<VideoSearchResponseItemModel[][]> GetTopFeaturedVideos(bool showAll)
        {
            var featuredCategoryName = RequestScopeFranchise switch
            {
                FranchiseType.Ford    => GetMappedId(VbrickMappingsType.FeaturedName),
                FranchiseType.Lincoln => GetMappedId(VbrickMappingsType.FeaturedLincolnName),
                _                     => ""
            };

            var categories         = await GetCategories();
            var featuredCategories = categories.Categories.Where(c => c.Fullpath.Contains(featuredCategoryName + "/")).ToList();

            var model = new VideoSearchRequestModel
            {
                Categories = featuredCategories.Select(c => c.CategoryId).ToList(),
                Count = showAll ? 30 : 3,
                SortField = SortFieldType.WhenUploaded,
                SortDirection = SortDirectionType.Desc,
                ScrollId = null
            };

            var featuredVideos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            if (!showAll) return new[] { featuredVideos.Videos };

            var count  = featuredVideos.Videos.Length / 3;
            var result = new VideoSearchResponseItemModel[count][];

            for (var i = 0; i < count; i++)
            {
                var tuple = new VideoSearchResponseItemModel[3];
                result[i] = tuple;

                tuple[0] = featuredVideos.Videos[i * 3];
                tuple[1] = featuredVideos.Videos[i * 3 + 1];
                tuple[2] = featuredVideos.Videos[i * 3 + 2];
            }

            return result;
        }


        public async Task<VideoSearchResponseModel> GetTopVideos(string scrollId)
        {
            var categories = await GetFilteredCategories();

            var model = new VideoSearchRequestModel
            {
                Categories = categories.Categories.Select(c => c.CategoryId).ToList(),
                Count = 3,
                SortField = SortFieldType.WhenUploaded,
                SortDirection = SortDirectionType.Desc,
                ScrollId = scrollId
            };

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);
        }


        public async Task<UserModel> GetUser(string id) { return await _revApiClient.GetAsync<UserModel>(string.Format(VbrickApiEndpoints.UserUrl, id)); }


        public async Task<UserModel> GetUserByUserName(string userName) { return await _revApiClient.GetAsync<UserModel>(string.Format(VbrickApiEndpoints.UserByUserNameUrl, userName)); }


        public async Task<VideoSearchResponseModel> GetUserVideos(ManageVideoModel model)
        {
            UserModel user = null;

            if (!string.IsNullOrEmpty(model.UserName))
            {
                user = await _revApiClient.GetAsync<UserModel>(string.Format(VbrickApiEndpoints.UserByUserNameUrl, model.UserName));
            }

            var requestModel = new VideoSearchRequestModel
            {
                // ReSharper disable once PossibleNullReferenceException
                UploaderIds = model.UserName == null ? new List<string>() : new List<string> { user?.UserId },
                Count = 50,
                ExactMatch = true,
                SortField = SortFieldType.WhenUploaded,
                SortDirection = SortDirectionType.Desc,
                SearchField = SearchFieldType.Uploader
            };

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both)
                requestModel.Categories.Add(GetMappedId(VbrickMappingsType.FordId));

            else
                requestModel.Categories.Add(GetMappedId(VbrickMappingsType.LincolnId));

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + requestModel);
        }


        public async Task<CommentModel> GetVideoComments(string id) { return await _revApiClient.GetAsync<CommentModel>(string.Format(VbrickApiEndpoints.VideoCommentsUrl, id)); }


        public async Task<VideoDetailsModel> GetVideoDetails(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id)) ?? await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            // ReSharper disable once ConvertIfStatementToNullCoalescingExpression
            if (details == null) details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            details.Archived = details.Categories.Contains(GetMappedId(VbrickMappingsType.ArchiveId));

            details.Flagged = details.Categories.Contains(GetMappedId(RequestScopeFranchise == FranchiseType.Lincoln ? VbrickMappingsType.LincolnFlaggedId : VbrickMappingsType.FordFlaggedId));

            var officialCategory  = GetMappedId(VbrickMappingsType.OfficialCategoryId);
            var ownerNameId       = GetMappedId(VbrickMappingsType.OwnerNameId);
            var ownerEmailId      = GetMappedId(VbrickMappingsType.OwnerEmailId);
            var contactNameId     = GetMappedId(VbrickMappingsType.ContactsNameId);
            var contactEmailId    = GetMappedId(VbrickMappingsType.ContactsEmailId);
            var uploadDateFieldId = GetMappedId(VbrickMappingsType.UploadDateFieldId);

            details.IsOfficial = details.Categories.Any(f => f               == officialCategory);
            details.BusinessOwnerName = details.CustomFields.Where(f => f.Id == ownerNameId).Select(f => f.Value).First();

            details.BusinessOwnerEmail = details.CustomFields.Where(f => f.Id == ownerEmailId).Select(f => f.Value).First();

            details.ContactsName = details.CustomFields.Where(f => f.Id == contactNameId).Select(f => f.Value).First();

            details.ContactsEmail = details.CustomFields.Where(f => f.Id == contactEmailId).Select(f => f.Value).First();

            var supplementalFiles = await _revApiClient.GetAsync<SupplementalFilesResponseModel>(string.Format(VbrickApiEndpoints.GetSupplimentalFilesUrl, id));

            if (supplementalFiles != null && supplementalFiles.SupplementalFiles.Count > 0) details.SupplementalFiles = supplementalFiles.SupplementalFiles;

            var uploadDateField = details.CustomFields.FirstOrDefault(c => c.Id == uploadDateFieldId);

            if (uploadDateField != null && uploadDateField.Value != "") details.WhenUploaded = DateTime.Parse(uploadDateField.Value);

            return details;
        }

        public async Task<int> GetViewCountForPeriod(string videoId, DateTime startDate, DateTime endDate)
        {
            var startDateString = startDate.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var endDateString   = endDate.ToString("yyyy-MM-ddTHH:mm:ssZ");

            var requestUrl = string.Format(VbrickApiEndpoints.VideoStatisticsSummary, videoId);
            var queryParameters = new
            {
                after = startDateString,
                before = endDateString
            };

            var response = await _revApiClient.GetAsync<VideoSummaryStatisticsResponse>(requestUrl, queryParameters);

            return response.TotalViews;
        }


        public async Task<int> GetViewsSincePublished(string videoId, DateTime publishDate)
        {
            var startDateString = publishDate.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var endDateString   = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

            var requestUrl = string.Format(VbrickApiEndpoints.VideoStatisticsSummary, videoId);
            var queryParameters = new
            {
                after = startDateString,
                before = endDateString
            };

            var response = await _revApiClient.GetAsync<VideoSummaryStatisticsResponse>(requestUrl, queryParameters);

            return response.TotalViews;
        }


        public async Task<VideoDetailsModel> GetVideoDetailsForEdit(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var fordId       = GetMappedId(VbrickMappingsType.FordId);
            var lincolnId    = GetMappedId(VbrickMappingsType.LincolnId);
            var fordVideo    = details.Categories.Any(c => c == fordId);
            var lincolnVideo = details.Categories.Any(c => c == lincolnId);

            if (fordVideo && lincolnVideo)
                details.Franchise = FranchiseType.Both;
            else if (lincolnVideo)
                details.Franchise = FranchiseType.Lincoln;
            else
                details.Franchise = FranchiseType.Ford;

            var categories          = details.CategoryPaths.ToList();
            var result              = new List<CategoryPathModel>();
            var fordCategoryName    = GetMappedId(VbrickMappingsType.FordCategoryName);
            var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);
            result.AddRange(categories.Where(c => c.FullPath.Contains(fordCategoryName    + "/")).ToList());
            result.AddRange(categories.Where(c => c.FullPath.Contains(lincolnCategoryName + "/")).ToList());
            result.ForEach(c => c.FullPath = c.FullPath.Replace(lincolnCategoryName + "/", "").Replace(fordCategoryName + "/", ""));

            details.CategoryPaths = result.ToArray();

            var ownerNameId        = GetMappedId(VbrickMappingsType.OwnerNameId);
            var ownerEmailId       = GetMappedId(VbrickMappingsType.OwnerEmailId);
            var contactNameId      = GetMappedId(VbrickMappingsType.ContactsNameId);
            var contactEmailId     = GetMappedId(VbrickMappingsType.ContactsEmailId);
            var notesFieldId       = GetMappedId(VbrickMappingsType.NotesFieldId);
            var officialCategoryId = GetMappedId(VbrickMappingsType.OfficialCategoryId);
            var rejectedCategoryId = GetMappedId(VbrickMappingsType.RejectedCategoryId);

            var categoriesFranchise = GetMappedId(RequestScopeFranchise == FranchiseType.Ford ? VbrickMappingsType.FordApprovalCategoryId : VbrickMappingsType.LincolnApprovalCategoryId);

            var adminCategoryId = GetMappedId(VbrickMappingsType.AdminCategoryId);
            var uploadFieldId   = GetMappedId(VbrickMappingsType.UploadDateFieldId);
            var srtFileName     = GetMappedId(VbrickMappingsType.SrtFileNameFieldId);


            details.BusinessOwnerName = details.CustomFields.Where(f => f.Id == ownerNameId).Select(f => f.Value).First();

            details.BusinessOwnerEmail = details.CustomFields.Where(f => f.Id == ownerEmailId).Select(f => f.Value).First();

            details.ContactsName = details.CustomFields.Where(f => f.Id  == contactNameId).Select(f => f.Value).First();
            details.ContactsEmail = details.CustomFields.Where(f => f.Id == contactEmailId).Select(f => f.Value).First();

            details.Notes = details.CustomFields.Where(f => f.Id == notesFieldId).Select(f => f.Value).First();
            details.IsOfficial = details.Categories.Any(f => f   == officialCategoryId);
            details.IsRejected = details.Categories.Any(f => f   == rejectedCategoryId);

            details.IsPendingApproval = details.Categories.Any(f => f == categoriesFranchise);

            details.IsAdmin = details.Categories.Any(f => f == adminCategoryId);
            var uploadDateField = details.CustomFields.FirstOrDefault(c => c.Id == uploadFieldId);

            if (uploadDateField != null && uploadDateField.Value != "") details.WhenUploaded = DateTime.Parse(uploadDateField.Value);

            if (details.PublishDate == null) details.PublishDate = details.WhenUploaded;

            var srtField = details.CustomFields.FirstOrDefault(c => c.Id == srtFileName);

            if (srtField != null && srtField.Value != "") details.SrtFileName = srtField.Value;


            var restrictionCategoryRequest = new GetCategoriesRequestModel { ParentCategoryId = GetMappedId(VbrickMappingsType.RestrictionsCategoryId) };

            var restrictionCategories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl + restrictionCategoryRequest);

            details.RestrictionCategories = details.Categories.Where(c => restrictionCategories.Categories.Any(rc => rc.CategoryId == c)).ToList();

            var supplementalFilesResponseModel = await _revApiClient.GetAsync<SupplementalFilesResponseModel>(string.Format(VbrickApiEndpoints.GetSupplimentalFilesUrl, id));

            details.SupplementalFiles = supplementalFilesResponseModel.SupplementalFiles;

            return details;
        }


        public async Task<VideoEmbeddingModel> GetVideoEmbedInfo(VideoEmbeddingQueryModel model) { return await _revApiClient.GetAsync<VideoEmbeddingModel>(VbrickApiEndpoints.VideoEmbedingUrls + model); }


        public async Task<VideoFieldModel[]> GetVideoFields() { return await _revApiClient.GetAsync<VideoFieldModel[]>(VbrickApiEndpoints.VideoFieldsUrl); }


        public async Task<FranchiseType> GetVideoFranchise(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            if (details == null) return FranchiseType.Ford;

            var fordId       = GetMappedId(VbrickMappingsType.FordId);
            var lincolnId    = GetMappedId(VbrickMappingsType.LincolnId);
            var fordVideo    = details.Categories.Any(c => c == fordId);
            var lincolnVideo = details.Categories.Any(c => c == lincolnId);

            if (fordVideo && lincolnVideo) return FranchiseType.Both;

            return lincolnVideo ? FranchiseType.Lincoln : FranchiseType.Ford;
        }


        public async Task<VideoReportModel[]> GetVideoReport(VideoReportQueryModel model) { return await _revApiClient.GetAsync<VideoReportModel[]>(VbrickApiEndpoints.VideoReportUrl + (model == null ? "" : model.ToString())); }


        public async Task<VideosListModel> GetVideos() { return await _revApiClient.GetAsync<VideosListModel>(string.Format(VbrickApiEndpoints.AllVideosUrl)); }


        public async Task<int> GetVideosCount()
        {
            var model = new VideoSearchRequestModel { Count = 1, Status = VideoStatus.Active };

            if (model.Categories.Count == 0)
            {
                if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both)
                    model.Categories.Add(GetMappedId(VbrickMappingsType.FordId));
                else
                    model.Categories.Add(GetMappedId(VbrickMappingsType.LincolnId));
            }

            var result = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            return result.TotalVideos;
        }


        public async Task<VideoStatusModel> GetVideoStatus(string id) { return await _revApiClient.GetAsync<VideoStatusModel>(string.Format(VbrickApiEndpoints.VideoStatusUrl, id)); }


        public async Task<VideoViewStatusMode> GetViewStatusMode(string videoId, string userId) { return await _revApiClient.GetAsync<VideoViewStatusMode>(string.Format(VbrickApiEndpoints.VideoViewStatusUrl, videoId, userId)); }


        public async Task<ZoneDevicesModel> GetZoneDevices(string zoneId) { return await _revApiClient.GetAsync<ZoneDevicesModel>(VbrickApiEndpoints.ZonesUrl); }


        public async Task<ZonesModel> GetZones() { return await _revApiClient.GetAsync<ZonesModel>(VbrickApiEndpoints.ZonesUrl); }


        public async Task InactivateVideo(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            details.IsActive = false;

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);
        }


        public async Task<VideoSearchResponseModel> InactiveVideos(string scrollId)
        {
            var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 50, Status = VideoStatus.Inactive };

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);
        }


        public async Task MakeVideoFeatured(MakeVideoFeaturedModel model)
        {
            var videoModel = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, model.VideoId));

            videoModel.Categories.Clear();
            videoModel.Categories.Add(model.CategoryId);

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, model.VideoId), videoModel);
        }


        public async Task ManageFeaturedList(ManagePlaylistVideosModel model) { await _revApiClient.PutAsync(VbrickApiEndpoints.ManageFeaturedListUrl, model); }


        public async Task ManagePlaylist(string id, ManagePlaylistVideosModel model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.ManagePlaylistUrl, id), model); }


        public async Task<VideoSearchResponseModel> MostRecentVideos()
        {
            var model = new VideoSearchRequestModel { Count = 10, SortDirection = SortDirectionType.Desc, SortField = SortFieldType.WhenUploaded };

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both)
                model.Categories.Add(GetMappedId(VbrickMappingsType.FordId));
            else
                model.Categories.Add(GetMappedId(VbrickMappingsType.LincolnId));

            var videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            videos.Videos = videos.Videos.Where(v => v.ThumbnailUrl != "").OrderByDescending(v => v.WhenUploaded).Take(6).ToArray();

            return videos;
        }


        public async Task<AccessEntitiesModel> QueryAccessEntities(string query, string type = "User") { return await _revApiClient.GetAsync<AccessEntitiesModel>(string.Format(VbrickApiEndpoints.AccessEntitiesQueryUrl, query, type)); }


        public Dictionary<string, Tuple<string, DateTime>> ReadMigrationFile(string fileName)
        {
            var result = new Dictionary<string, Tuple<string, DateTime>>();

            foreach (var line in File.ReadAllLines(fileName))
            {
                var items = line.Replace("\"", "").Split("\t");

                var user = items[1] switch
                {
                    "	Michael Davis" => "mdavi356",
                    "Jason Danyliw"  => "jdanyliw",
                    _                => "vbirbili2"
                };

                result.Add(items[0], new Tuple<string, DateTime>(user, DateTime.Parse(items[2])));
            }

            return result;
        }


        public async Task RejectVideo(string videoId) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.RejectVideoUrl, videoId), null); }


        public async Task RejectVideoRequest(string id)
        {
            var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            details.IsActive = true;
            var officialCategoryId        = GetMappedId(VbrickMappingsType.OfficialCategoryId);
            var fordApprovalCategoryId    = GetMappedId(VbrickMappingsType.FordApprovalCategoryId);
            var lincolnApprovalCategoryId = GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId);

            details.Categories = details.Categories.Where(c => c != officialCategoryId && c != fordApprovalCategoryId && c != lincolnApprovalCategoryId).ToList();

            details.Categories.Add(GetMappedId(VbrickMappingsType.RejectedCategoryId));

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);
        }


        public async Task<bool> ReplaceVideo(string id, ReplaceVideoModel model)
        {
            var parameters = new Dictionary<string, object> { { "VideoFile", new RevFileParameterModel(model.Data, model.FileName) } };

            var details = _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id)); //VBrick has issue and set isActive to false if we replace video

            using var response = _revApiClient.MultipartFormDataPost(string.Format(VbrickApiEndpoints.ReplaceVideoUrl, id), parameters, HttpMethod.Put);

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), details);

            return response.StatusCode == HttpStatusCode.OK;
        }


        public async Task<GroupModel> SearchGroup(string groupId, string scrollId = null) { return await _revApiClient.GetAsync<GroupModel>(string.Format(VbrickApiEndpoints.SearchGroupUrl, groupId) + (scrollId != null ? "?scrollId=" + scrollId : "")); }


        public async Task<VideoSearchResponseModel> SearchPrivateVideos(string scrollId)
        {
            var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 6 };

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both) model.Categories.Add(GetMappedId(VbrickMappingsType.FordPrivateId));

            if (RequestScopeFranchise == FranchiseType.Lincoln || RequestScopeFranchise == FranchiseType.Both) model.Categories.Add(GetMappedId(VbrickMappingsType.LincolnPrivateId));

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);
        }


        public async Task<SearchTeamModel[]> SearchTeam() { return await _revApiClient.GetAsync<SearchTeamModel[]>(VbrickApiEndpoints.SearchTeamsUrl); }


        public async Task<VideoSearchResponseModel> SearchVideo(VideoSearchRequestModel model)
        {
            if (model.Categories.Count != 0) return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both)
                model.Categories.Add(GetMappedId(VbrickMappingsType.FordId));
            else
                model.Categories.Add(GetMappedId(VbrickMappingsType.LincolnId));

            return await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);
        }


        public async Task<VideoSearchResponseModel> SearchVideoByRating(List<string> videos)
        {
            var response       = new VideoSearchResponseModel();
            var detailedVideos = new List<VideoSearchResponseItemModel>();

            foreach (var id in videos)
            {
                var details = await GetVideoDetails(id);

                if (details is { IsActive: true })
                    detailedVideos.Add(new VideoSearchResponseItemModel
                    {
                        Id = id,
                        Description = details.Description,
                        Title = details.Title,
                        ThumbnailUrl = details.ThumbnailUrl,
                        UploadedBy = details.UploadedBy,
                        WhenUploaded = details.WhenUploaded ?? DateTime.Now
                    });
            }

            response.TotalVideos = detailedVideos.Count;
            response.Videos = detailedVideos.ToArray();

            return response;
        }


        public async Task SendVideoForApproval(string videoId, string templateId) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.SendVideoForApprovalUrl, videoId, templateId), null); }


        public async Task SetConfigVBrickApi(bool bypass = false)
        {
            if (bypass)
            {
                MappedObjects = null;
                RequestScopeFranchise = FranchiseType.Both;
            }

            var mapped = await _mappingRepository.GetAllAsync();
            MappedObjects = mapped.ToList();
            var franchise = _httpAccessor.HttpContext.Request.Headers.Keys.Contains(FranchiseHeaderName) ? _httpAccessor.HttpContext.Request.Headers[FranchiseHeaderName][0] : null;

            if (franchise == null)
                RequestScopeFranchise = FranchiseType.Both;
            else
                RequestScopeFranchise = (FranchiseType)Enum.Parse(typeof(FranchiseType), franchise);
        }


        public async Task<string> StartRecording(StartRecordingModel model)
        {
            var result = await _revApiClient.PostAsync<RecordingModel>(VbrickApiEndpoints.StartRecordingUrl, model);

            return result?.VideoId;
        }


        public async Task<string> StopRecording(RecordingModel model)
        {
            var result = await _revApiClient.PostAsync<StopRecordingResponseModel>(VbrickApiEndpoints.StopRecordingUrl, model);

            return result?.Type;
        }


        public async Task UnarchiveVideo(string id)
        {
            var model = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var archivedId = GetMappedId(VbrickMappingsType.ArchiveId);
            model.Categories = model.Categories.Where(c => c != archivedId).ToList();

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), model);
        }


        public async Task UnflagVideo(string id)
        {
            var model = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var flaggedId = GetMappedId(RequestScopeFranchise == FranchiseType.Lincoln ? VbrickMappingsType.LincolnFlaggedId : VbrickMappingsType.FordFlaggedId);

            model.Categories = model.Categories.Where(c => c != flaggedId).ToList();

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), model);
        }


        public async Task UpdateAdminVideos()
        {
            string                   scrollId = null;
            VideoSearchResponseModel videos;
            var                      count = 0;

            do
            {
                var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 100 };

                videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

                count += videos.Videos.Length;

                foreach (var video in videos.Videos) await UpdateAdminVideo(video);

                scrollId = videos.ScrollId;
            } while (videos.TotalVideos > count);
        }


        public async Task UpdateMigratedVideo(string id, Tuple<string, DateTime> migrationData)
        {
            var model = new MigrationModel { UserName = migrationData.Item1, WhenUploaded = migrationData.Item2 };

            await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.VideoMigrationUrl, id), model);
        }


        public async Task UpdateMigratedVideos(Dictionary<string, Tuple<string, DateTime>> data)
        {
            var list = MappedObjects;

            MappedObjects = new List<VbrickMapping>
            {
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 1,
                    UpdatedOn = DateTime.Now,
                    Name = "LincolnId",
                    Type = "CategoryId",
                    VbrickId = "83336fa7-43b1-4233-a117-60a60a4c5bcd"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 1,
                    UpdatedOn = DateTime.Now,
                    Name = "FordId",
                    Type = "CategoryId",
                    VbrickId = "d78d6347-04f4-428e-ae47-58a5d9380b8e"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 1,
                    UpdatedOn = DateTime.Now,
                    Name = "FordCategoryName",
                    Type = "Name",
                    VbrickId = "FORD (DON'T REMOVE)"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 1,
                    UpdatedOn = DateTime.Now,
                    Name = "LincolnCategoryName",
                    Type = "Name",
                    VbrickId = "LINCOLN (DON'T REMOVE)"
                }
            };

            string                   scrollId = null;
            VideoSearchResponseModel videos;
            var                      count = 0;

            do
            {
                var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 100 };

                videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

                count += videos.Videos.Length;

                foreach (var video in videos.Videos)
                    if (data.ContainsKey(video.Id))
                        await UpdateMigratedVideo(video.Id, data[video.Id]);

                scrollId = videos.ScrollId;
            } while (videos.TotalVideos > count);

            MappedObjects = list;
        }


        public async Task UpdateOfficialVideos()
        {
            var list = MappedObjects;

            MappedObjects = new List<VbrickMapping>
            {
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 1,
                    UpdatedOn = DateTime.Now,
                    Name = "OwnerEmailId",
                    Type = "FieldId",
                    VbrickId = "51397ba7-ed50-4d7e-81ff-0ee230ccc83d"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 2,
                    UpdatedOn = DateTime.Now,
                    Name = "AdminCategoryId",
                    Type = "CategoryId",
                    VbrickId = "d3f4fb35-5592-47a0-be4e-d04882948fa0"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 3,
                    UpdatedOn = DateTime.Now,
                    Name = "OfficialCategoryId",
                    Type = "CategoryId",
                    VbrickId = "fb7019d6-e4aa-42af-82d5-1e47830c2812"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 3,
                    UpdatedOn = DateTime.Now,
                    Name = "RejectedCategoryId",
                    Type = "CategoryId",
                    VbrickId = "1c36b4e5-ebe2-426e-9802-447e7c7cff38"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 3,
                    UpdatedOn = DateTime.Now,
                    Name = "FordApprovalCategoryId",
                    Type = "CategoryId",
                    VbrickId = "4631c05d-6d69-49b6-82b1-0703efec58db"
                },
                new VbrickMapping
                {
                    CreatedOn = DateTime.Now,
                    Id = 3,
                    UpdatedOn = DateTime.Now,
                    Name = "LincolnApprovalCategoryId",
                    Type = "CategoryId",
                    VbrickId = "8cf739ec-6a5f-4bdc-9c7d-0a7bcae75a0b"
                }
            };

            string                   scrollId = null;
            VideoSearchResponseModel videos;
            var                      count = 0;

            do
            {
                var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 100 };

                videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

                count += videos.Videos.Length;

                foreach (var video in videos.Videos) await UpdateOfficialVideo(video);

                scrollId = videos.ScrollId;
            } while (videos.TotalVideos > count);

            MappedObjects = list;
        }


        public async Task UpdateVideo(string id)
        {
            var model = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, id));

            var fordCategoryName    = GetMappedId(VbrickMappingsType.FordCategoryName);
            var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);
            var fordFound           = false;
            var lincolnFound        = false;

            foreach (var category in model.CategoryPaths)
            {
                if (category.FullPath.Contains(fordCategoryName)) fordFound = true;

                if (category.FullPath.Contains(lincolnCategoryName)) lincolnFound = true;

                if (fordFound && lincolnFound) break;
            }

            var updated = false;

            if (fordFound)
            {
                var cId = GetMappedId(VbrickMappingsType.FordId);

                if (model.Categories.All(c => c != cId))
                {
                    model.Categories.Add(cId);
                    updated = true;
                }
            }

            if (lincolnFound)
            {
                var cId = GetMappedId(VbrickMappingsType.LincolnId);

                if (model.Categories.All(c => c != cId))
                {
                    model.Categories.Add(cId);
                    updated = true;
                }
            }

            if (updated) await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, id), model);
        }


        public async Task UpdateVideos()
        {
            string                   scrollId = null;
            VideoSearchResponseModel videos;
            var                      count = 0;

            do
            {
                var model = new VideoSearchRequestModel { ScrollId = scrollId, Count = 100 };

                videos = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

                count += videos.Videos.Length;

                foreach (var video in videos.Videos) await UpdateVideo(video.Id);

                scrollId = videos.ScrollId;
            } while (videos.TotalVideos > count);
        }


        public UploadVideoResponseModel UploadAdminVideo(UploadVideoModel model)
        {
            var categories = model.Categories.ToList();
            categories.Add(GetMappedId(VbrickMappingsType.AdminCategoryId));
            categories.Add(GetMappedId(VbrickMappingsType.OfficialCategoryId));
            model.Categories = categories.ToArray();

            return UploadVideo(model, true);
        }


        public UploadVideoResponseModel UploadDealerVideo(UploadVideoModel model)
        {
            var categories = new List<string>();

            switch (RequestScopeFranchise)
            {
                case FranchiseType.Ford:
                    categories.Add(GetMappedId(VbrickMappingsType.FordDealerId));

                    break;

                case FranchiseType.Lincoln:
                    categories.Add(GetMappedId(VbrickMappingsType.LincolnDealerId));

                    break;

                case FranchiseType.Both:
                    categories.Add(GetMappedId(VbrickMappingsType.FordDealerId));
                    categories.Add(GetMappedId(VbrickMappingsType.LincolnDealerId));

                    break;
            }

            if (model.Categories.Contains(GetMappedId(VbrickMappingsType.OfficialCategoryId))) categories.Remove(GetMappedId(VbrickMappingsType.OfficialCategoryId));


            if (model.PartOfSeries) categories.Add(GetMappedId(VbrickMappingsType.PartOfSeriesId));

            model.Categories = categories.ToArray();

            return UploadVideo(model);
        }


        public bool UploadSupplementalFiles(string id, AddSupplementalFilesModel model, List<byte[]> files)
        {
            var parameters = new Dictionary<string, object>();

            for (var i = 0; i < model.Files.Count; i++) parameters.Add($"File{i}", new RevFileParameterModel(files[i], model.Files[i].FileName));

            parameters.Add("SupplementalFiles", JsonConvert.SerializeObject(model));

            var response = _revApiClient.MultipartFormDataPost(string.Format(VbrickApiEndpoints.UploadSupplimentalFilesUrl, id), parameters, HttpMethod.Post);

            return response.StatusCode == HttpStatusCode.OK;
        }


        public bool UploadThumbnail(string id, string fileName, byte[] data)
        {
            var parameters = new Dictionary<string, object> { { "Thumbnail image file", new RevFileParameterModel(data, fileName) } };

            var response = _revApiClient.MultipartFormDataPost(string.Format(VbrickApiEndpoints.UploadThumbnailUrl, id), parameters, HttpMethod.Post);

            return response.StatusCode == HttpStatusCode.OK;
        }


        public bool UploadTranscriptionFile(TranscriptFileModel model)
        {
            var parameters = new Dictionary<string, object>();

            if (model.Data != null) parameters.Add("File1", new RevFileParameterModel(model.Data, model.FileName, "application/octet-stream"));

            parameters.Add("TranscriptionFiles", JsonConvert.SerializeObject(new AddTranscriptionFilesModel(model.FileName)));

            var response = _revApiClient.MultipartFormDataPost(string.Format(VbrickApiEndpoints.UploadTranscriptionFile, model.Id), parameters, HttpMethod.Post);

            return response.StatusCode == HttpStatusCode.OK;
        }


        public UploadVideoResponseModel UploadVideo(UploadVideoModel model, bool isActive = false)
        {
            var customFields = new List<CustomFieldModel>
            {
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.OwnerNameId), Value = model.BusinessOwnerName },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.OwnerEmailId), Value = model.BusinessOwnerEmail },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.ContactsNameId), Value = model.ContactsName },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.ContactsEmailId), Value = model.ContactsEmail },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.UploaderID), Value = model.Uploader },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.SrtFileNameFieldId), Value = model.SrtFileName ?? "" }
            };

            var video = new VideoModel
            {
                EnableDownloads = model.EnableDownloads,
                Title = model.Title,
                IsActive = isActive,
                Description = model.Description,
                DoNotTranscode = false,
                Uploader = !string.IsNullOrEmpty(model.Uploader) ? model.Uploader : "",
                Tags = new List<string>(model.Tags),
                CategoryIds = new List<string>(model.Categories),
                VideoAccessControl = VideoAccessControlType.AllUsers.ToString(),
                CustomFields = customFields
            };


            if (model.PublishDate.GetValueOrDefault() == DateTime.Today) model.PublishDate = null;


            if (model.AccessControlEntities.Length > 0)
            {
                video.CategoryIds.AddRange(model.AccessControlEntities.Select(c => c.Id));
                video.CategoryIds.Add(GetMappedId(VbrickMappingsType.RestrictionsCategoryId));
            }

            video.CategoryIds.AddRange(model.FranchiseCategories);

            if (Franchise == FranchiseType.Ford || Franchise == FranchiseType.Both) video.CategoryIds.Add(GetMappedId(VbrickMappingsType.FordApprovalCategoryId));

            if (Franchise == FranchiseType.Lincoln || Franchise == FranchiseType.Both) video.CategoryIds.Add(GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId));

            if (!model.FranchiseCategories.Any())
            {
                var fordId    = GetMappedId(VbrickMappingsType.FordId);
                var lincolnId = GetMappedId(VbrickMappingsType.LincolnId);

                if ((Franchise == FranchiseType.Ford || Franchise == FranchiseType.Both) && !video.CategoryIds.Contains(fordId)) video.CategoryIds.Add(fordId);

                if ((Franchise == FranchiseType.Lincoln || Franchise == FranchiseType.Both) && !video.CategoryIds.Contains(lincolnId)) video.CategoryIds.Add(lincolnId);
            }

            var parameters = new Dictionary<string, object> { { "Video", JsonConvert.SerializeObject(video) }, { "VideoFile", new RevFileParameterModel(model.Data, model.FileName) } };

            using (var response = _revApiClient.MultipartFormDataPost(VbrickApiEndpoints.UploadVideoUrl, parameters, HttpMethod.Post))
            {
                if (response.StatusCode != HttpStatusCode.OK) return null;

                using var streamReader = new StreamReader(response.GetResponseStream()!);


                var resultStr = streamReader.ReadToEnd();


                return JsonConvert.DeserializeObject<UploadVideoResponseModel>(resultStr);
            }
        }


        public async Task<UploadVideoResponseModel> UploadVideoByUrl(UploadVideoByUrlModel model) { return await _revApiClient.PostAsync<UploadVideoResponseModel>(VbrickApiEndpoints.UploadVideoByUrl, model); }


        public UploadVideoResponseModel UploadVideoRequest(UploadVideoModel model)
        {
            var customFields = new List<CustomFieldModel>
            {
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.OwnerNameId), Value = model.BusinessOwnerName },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.OwnerEmailId), Value = model.BusinessOwnerEmail },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.ContactsNameId), Value = model.ContactsName },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.ContactsEmailId), Value = model.ContactsEmail },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.NotesFieldId), Value = model.Notes },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.UploaderID), Value = model.Uploader },
                new CustomFieldModel { Id = GetMappedId(VbrickMappingsType.SrtFileNameFieldId), Value = model.SrtFileName ?? "" }
            };

            var video = new VideoModel
            {
                EnableDownloads = model.EnableDownloads,
                IsActive = false,
                Title = model.Title,
                Description = model.Description,
                DoNotTranscode = false,
                Uploader = !string.IsNullOrEmpty(model.Uploader) ? model.Uploader : null,
                Tags = new List<string>(model.Tags),
                CategoryIds = new List<string>(model.Categories),
                VideoAccessControl = VideoAccessControlType.AllUsers.ToString(),
                CustomFields = customFields
            };

            if (model.PublishDate.GetValueOrDefault() == DateTime.Today) model.PublishDate = null;

            if (model.PartOfSeries) video.CategoryIds.Add(GetMappedId(VbrickMappingsType.PartOfSeriesId));

            if (model.Placeholder) video.CategoryIds.Add(GetMappedId(VbrickMappingsType.UploadLaterCategoryId));

            video.CategoryIds.Add(GetMappedId(VbrickMappingsType.OfficialCategoryId));

            video.CategoryIds.AddRange(model.FranchiseCategories);

            if (model.AccessControlEntities.Length > 0)
            {
                video.CategoryIds.AddRange(model.AccessControlEntities.Select(c => c.Id));
                video.CategoryIds.Add(GetMappedId(VbrickMappingsType.RestrictionsCategoryId));
            }

            if (Franchise == FranchiseType.Ford || Franchise == FranchiseType.Both) video.CategoryIds.Add(GetMappedId(VbrickMappingsType.FordApprovalCategoryId));

            if (Franchise == FranchiseType.Lincoln || Franchise == FranchiseType.Both) video.CategoryIds.Add(GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId));

            if (!model.FranchiseCategories.Any())
            {
                var fordId    = GetMappedId(VbrickMappingsType.FordId);
                var lincolnId = GetMappedId(VbrickMappingsType.LincolnId);

                if ((Franchise == FranchiseType.Ford || Franchise == FranchiseType.Both) && !video.CategoryIds.Contains(fordId)) video.CategoryIds.Add(fordId);

                if ((Franchise == FranchiseType.Lincoln || Franchise == FranchiseType.Both) && !video.CategoryIds.Contains(lincolnId)) video.CategoryIds.Add(lincolnId);
            }

            var parameters = new Dictionary<string, object> { { "Video", JsonConvert.SerializeObject(video) }, { "VideoFile", new RevFileParameterModel(model.Data, model.FileName) } };

            using var response = _revApiClient.MultipartFormDataPost(VbrickApiEndpoints.UploadVideoUrl, parameters, HttpMethod.Post);

            if (response.StatusCode != HttpStatusCode.OK) return null;

            using var streamReader = new StreamReader(response.GetResponseStream()!);

            var resultStr = streamReader.ReadToEnd();

            return JsonConvert.DeserializeObject<UploadVideoResponseModel>(resultStr);
        }


        public async Task VideoMigration(string id, MigrationModel model) { await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.VideoMigrationUrl, id), model); }


        public async Task<VideoSearchResponseModel> VideosForApproval(string scrollId)
        {
            var model = new VideoSearchRequestModel
            {
                ScrollId = scrollId,
                Count = 10,
                Status = VideoStatus.Inactive,
                SortDirection = SortDirectionType.Desc,
                SortField = SortFieldType.WhenUploaded
            };

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both) model.Categories.Add(GetMappedId(VbrickMappingsType.FordApprovalCategoryId));

            if (RequestScopeFranchise == FranchiseType.Lincoln || RequestScopeFranchise == FranchiseType.Both) model.Categories.Add(GetMappedId(VbrickMappingsType.LincolnApprovalCategoryId));

            var result = await _revApiClient.GetAsync<VideoSearchResponseModel>(VbrickApiEndpoints.SearchVideoUrl + model);

            foreach (var v in result.Videos)
            {
                var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, v.Id));

                var uploaderFieldId = GetMappedId(VbrickMappingsType.UploadDateFieldId);
                var uploadDateField = details.CustomFields.FirstOrDefault(f => f.Id == uploaderFieldId);
                var uploadDate      = v.WhenUploaded;

                if (uploadDateField != null)
                    if (!DateTime.TryParse(uploadDateField.Value, out uploadDate))
                        uploadDate = v.WhenUploaded;

                v.PartOfSeries = v.Categories.Contains(GetMappedId(VbrickMappingsType.PartOfSeriesId));
                v.UploadLater = v.Categories.Contains(GetMappedId(VbrickMappingsType.UploadLaterCategoryId));
                v.UploadDate = uploadDate;
            }

            return result;
        }


        private async Task<GetCategoriesModel> FilterCategories()
        {
            var categories = await _revApiClient.GetAsync<GetCategoriesModel>(VbrickApiEndpoints.CategoriesUrl);

            var result = new List<GetCategoryModel>();

            var categoriesList = categories.Categories.ToList().Where(c => !string.IsNullOrEmpty(c.CategoryId)).ToList();

            var fordCategoryName = GetMappedId(VbrickMappingsType.FordCategoryName);

            var lincolnCategoryName = GetMappedId(VbrickMappingsType.LincolnCategoryName);

            if (RequestScopeFranchise == FranchiseType.Ford || RequestScopeFranchise == FranchiseType.Both) result.AddRange(categoriesList.Where(c => c.Fullpath.Contains(fordCategoryName + "/")).ToList());

            if (RequestScopeFranchise == FranchiseType.Lincoln || RequestScopeFranchise == FranchiseType.Both) result.AddRange(categoriesList.Where(c => c.Fullpath.Contains(lincolnCategoryName + "/")).ToList());

            result.ForEach(c => c.Fullpath = c.Fullpath.Replace(lincolnCategoryName + "/", "").Replace(fordCategoryName + "/", ""));

            categories.Categories = result.ToArray();

            return categories;
        }


        private async Task UpdateAdminVideo(VideoSearchResponseItemModel video)
        {
            const string user    = "Ford Tube";
            var          updated = false;

            var officialCategoryId = GetMappedId(VbrickMappingsType.OfficialCategoryId);
            var adminCategoryId    = GetMappedId(VbrickMappingsType.AdminCategoryId);

            if (video.Categories.All(c => c != officialCategoryId) && video.Categories.All(c => c != adminCategoryId) && user != video.UploadedBy) updated = true;

            if (updated)
            {
                var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, video.Id));

                details.Categories.Add(GetMappedId(VbrickMappingsType.AdminCategoryId));
                details.Categories.Add(GetMappedId(VbrickMappingsType.OfficialCategoryId));
                details.Categories = details.Categories.Where(c => c != "").ToList();
                await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, video.Id), details);
            }
        }


        private async Task UpdateOfficialVideo(VideoSearchResponseItemModel video)
        {
            var users = new List<string> { "Migration User", "Official Video" };


            var rejectedCategoryId = GetMappedId(VbrickMappingsType.RejectedCategoryId);
            var adminCategoryId    = GetMappedId(VbrickMappingsType.AdminCategoryId);
            var officialCategoryId = GetMappedId(VbrickMappingsType.OfficialCategoryId);
            var ownerEmailId       = GetMappedId(VbrickMappingsType.OwnerEmailId);

            if (video.Categories.All(c => c != officialCategoryId))
            {
                var updated = false;
                var details = await _revApiClient.GetAsync<VideoDetailsModel>(string.Format(VbrickApiEndpoints.VideoDetailsUrl, video.Id));

                var emailField = details.CustomFields.FirstOrDefault(f => f.Id == ownerEmailId);

                if (details.Categories.All(c => c != rejectedCategoryId) && emailField != null && !string.IsNullOrEmpty(emailField.Value))
                {
                    updated = true;
                    details.Categories.Add(GetMappedId(VbrickMappingsType.OfficialCategoryId));
                }

                if (details.Categories.All(c => c != adminCategoryId) && users.Contains(details.UploadedBy) && (emailField == null || string.IsNullOrEmpty(emailField.Value)))
                {
                    updated = true;
                    details.Categories.Add(GetMappedId(VbrickMappingsType.AdminCategoryId));
                    details.Categories.Add(GetMappedId(VbrickMappingsType.OfficialCategoryId));
                }

                if (updated)
                {
                    details.Categories = details.Categories.Where(c => c != "").ToList();
                    await _revApiClient.PutAsync(string.Format(VbrickApiEndpoints.EditVideoDetailsUrl, video.Id), details);
                }
            }
        }

    }

}