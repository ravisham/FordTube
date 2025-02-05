// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited.

using System.Net;
using System.Net.Http.Headers;
using System.Text;
using FordTube.EmailsService;
using FordTube.VBrick.Wrapper.Enums;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

using Newtonsoft.Json;

using OneMagnify.Common.Extensions;
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Entities.Enums;
using OneMagnify.Data.Ford.FordTube.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{

    using System.Security.Authentication;


    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class VideoController : ControllerBase
    {

        private readonly IConfiguration _configuration;

        private readonly Microsoft.Extensions.Hosting.IHostEnvironment _environment;
        private readonly IMemoryCache _memoryCache;

        private readonly IFileRepository _fileRepository;

        private readonly ILogger _logger;

        private readonly IRatingRepository _ratingRepository;

        private readonly IReportRepository _reportRepository;


        private readonly IVBrickApiRepository _vbrickApi;

        private readonly IVideoRatingRepository _videoRatingRepository;

        private readonly IVideoRepository _videoRepository;


        public VideoController(IVideoRepository videoRepository,
                               IVideoRatingRepository videoRatingRepository,
                               IRatingRepository ratingRepository,
                              
                               IFileRepository                               fileRepository,
                               IReportRepository                             reportRepository,
                               Microsoft.Extensions.Hosting.IHostEnvironment environment,
                               ILogger<VideoController>                      logger,
                               IConfiguration                                configuration,
                               IVBrickApiRepository                          vbrickApi,
                               IMemoryCache                                  memoryCache)
        {
            _fileRepository = fileRepository;
            _videoRepository = videoRepository;
            _videoRatingRepository = videoRatingRepository;
            _ratingRepository = ratingRepository;
            
            _reportRepository = reportRepository;
            _environment = environment;
            _logger = logger;
            _configuration = configuration;
            _vbrickApi = vbrickApi;
            _memoryCache = memoryCache;
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Inactivate Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("delete/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Delete(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.InactivateVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Remove Video From VBrick
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("remove/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Remove(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Activate Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("activate/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Activate(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.ActivateVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///   Add Video Comments
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("add-comment/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> AddComment(string id, [FromBody] AddCommentModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            
            var response = await AddCommentHelper(id, model);

            _memoryCache.Remove(id);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///   Add Video Review
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(AddReviewResponseModel))]
        [HttpPut]
        [Route("add-review/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> AddReview(string id, [FromBody] AddReviewModel model)
        {
            if (model.Rating == 0) { return BadRequest("Please rate the video and try again."); }
            await _vbrickApi.SetConfigVBrickApi();
            
            var addRatingResponse = await AddRatingHelper(id, new EditRatingModel { Rating = model.Rating.ToString(), VideoId = id});
            var addCommentResponse = await AddCommentHelper(id, new AddCommentModel { Comment = model.Comment, UserName = model.UserName });

            _memoryCache.Remove(id);

            return Ok(new AddReviewResponseModel { TotalRatings = addRatingResponse.TotalRatings, AverageRating = addRatingResponse.AverageRating, Comments = addCommentResponse.Comments });
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///   Migrate Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("migrate/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Migrate(string id, [FromBody] MigrationModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.VideoMigration(id, model);

            return Ok();
        }


        /// <summary>
        ///   Get Mappings
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpGet]
        [Route("mappings")]
        public async Task<IActionResult> Mappings()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response =  _vbrickApi.GetMappings();

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Upload Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UploadVideoResponseModel))]
        [HttpPost]
        [Route("upload")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [RequestFormLimits(MultipartBodyLengthLimit = 4294967295)]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromBody] UploadVideoModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response =  _vbrickApi.UploadVideo(model);

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Upload Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UploadVideoResponseModel))]
        [HttpPost]
        [Route("dealer-upload")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [RequestFormLimits(MultipartBodyLengthLimit = 4294967295)]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadDealerVideo([FromBody] UploadVideoModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response =  _vbrickApi.UploadDealerVideo(model);

            return Ok(response);
        }


        /// <summary>
        ///   Upload Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UploadVideoResponseModel))]
        [HttpPost]
        [Route("dealer-upload2")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [RequestFormLimits(MultipartBodyLengthLimit = 4294967295)]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> DealerUpload2()
        {
            var model = JsonConvert.DeserializeObject<UploadVideoModel>(Request.Form["model"]);

            if (model.Placeholder)
            {
                var fileName = Path.Combine(_environment.ContentRootPath, "Videos\\placeholder.avi");
                model.FileName = "placeholder.avi";
                model.Data = await System.IO.File.ReadAllBytesAsync(fileName);
            }
            else
            {
                if (Request.Form.Files.Count == 0) return Ok();
                var file = Request.Form.Files[0];

                if (file.Length == 0) return Ok();

                if (file.Length > 0)
                {
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');

                    using (var stream = new MemoryStream())
                    {
                        await file.CopyToAsync(stream);
                        model.Data = stream.ToArray();
                        model.FileName = fileName;
                    }
                }
            }
            await _vbrickApi.SetConfigVBrickApi();
            var response =  _vbrickApi.UploadDealerVideo(model);
            await _vbrickApi.EditVideoExpirationDate(response.VideoId, model);

            return Ok(response);
        }


        /// <summary>
        ///   Upload Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UploadVideoResponseModel))]
        [HttpPost]
        [Route("upload2")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [RequestFormLimits(MultipartBodyLengthLimit = 4294967295)]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload2()
        {
            var model = JsonConvert.DeserializeObject<UploadVideoModel>(Request.Form["model"]);
            var srtFile = Request.Form.Files["srt"];
            model.SrtFileName = srtFile == null ? "" : srtFile.FileName;
            await _vbrickApi.SetConfigVBrickApi();

            if (model.Placeholder)
            {
                var fileName = Path.Combine(_environment.ContentRootPath, "Videos\\placeholder.avi");
                model.FileName = "placeholder.avi";
                model.Data = await System.IO.File.ReadAllBytesAsync(fileName);
            }
            else
            {
                if (Request.Form.Files.Count == 0) return Ok();
                var file = Request.Form.Files[0];

                if (file.Length == 0) return Ok();
                var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    model.Data = stream.ToArray();
                    model.FileName = fileName;
                }
            }

            var response =  _vbrickApi.UploadAdminVideo(model);

            await _vbrickApi.EditVideoExpirationDate(response.VideoId, model);
            var startInd = model.Placeholder ? 0 : 1;

            if (Request.Form.Files.Count > startInd)
            {
                var filesModel = new AddSupplementalFilesModel { Files = new List<AddSupplementalFileModel>() };
                var files = new List<byte[]>();

                for (var i = startInd; i < Request.Form.Files.Count; i++)
                {
                    var docFile = Request.Form.Files[i];

                    if (docFile.Name == "srt") continue;
                    var docFileName = ContentDispositionHeaderValue.Parse(docFile.ContentDisposition).FileName.Trim('"');
                    filesModel.Files.Add(new AddSupplementalFileModel { FileName = Path.GetFileName(docFileName) });

                    using (var stream = new MemoryStream())
                    {
                        await docFile.CopyToAsync(stream);
                        files.Add(stream.ToArray());
            // FST-427 - Reading supplemental files from vbrick and remove linking from OM database
           // var dbFile = new File { Name = filesModel.Files[i - startInd].FileName, VideoId = response.VideoId, BinaryContent = files[i - startInd], Content = "" };
           // await _fileRepository.AddAsync(dbFile);
                    }
                }

                if (files.Count > 0)  _vbrickApi.UploadSupplementalFiles(response.VideoId, filesModel, files);
            }

            if (srtFile == null) return Ok(response);

            {
                using (var stream = new MemoryStream())
                {
                    await srtFile.CopyToAsync(stream);
                     _vbrickApi.UploadTranscriptionFile(new TranscriptFileModel { Id = response.VideoId, Data = stream.ToArray(), FileName = srtFile.FileName });
                }
            }

            return Ok(response);
        }


        /// <summary>
        ///   Upload Video Request
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UploadVideoResponseModel))]
        [HttpPost]
        [Route("upload-request")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [RequestFormLimits(MultipartBodyLengthLimit = 4294967295)]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadRequest()
        {
            var model = JsonConvert.DeserializeObject<UploadVideoModel>(Request.Form["model"]);

            await _vbrickApi.SetConfigVBrickApi();
            var srtFile = Request.Form.Files["srt"];
            model.SrtFileName = srtFile == null ? "" : srtFile.FileName;

            if (model.Placeholder)
            {
                var fileName = Path.Combine(_environment.ContentRootPath, "Videos\\placeholder.avi");
                model.FileName = "placeholder.avi";
                model.Data = await System.IO.File.ReadAllBytesAsync(fileName);
            }
            else
            {
                if (Request.Form.Files.Count == 0) return Ok();
                var file = Request.Form.Files[0];

                if (file.Length == 0) return Ok();
                var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    model.Data = stream.ToArray();
                    model.FileName = fileName;
                }
            }

            var response =  _vbrickApi.UploadVideoRequest(model);

            await _vbrickApi.EditVideoExpirationDate(response.VideoId, model);
            var startInd = model.Placeholder ? 0 : 1;

            if (Request.Form.Files.Count > startInd)
            {
                var filesModel = new AddSupplementalFilesModel { Files = new List<AddSupplementalFileModel>() };
                var files = new List<byte[]>();

                for (var i = startInd; i < Request.Form.Files.Count; i++)
                {
                    var docFile = Request.Form.Files[i];

                    if (docFile.Name == "srt") continue;
                    var docFileName = ContentDispositionHeaderValue.Parse(docFile.ContentDisposition).FileName.Trim('"');
                    filesModel.Files.Add(new AddSupplementalFileModel { FileName = Path.GetFileName(docFileName) });

                    using (var stream = new MemoryStream())
                    {
                        await docFile.CopyToAsync(stream);
                        files.Add(stream.ToArray());
           // FST-427 - Reading supplemental files from vbrick and remove linking from OM database
           // var dbFile = new File { Name = filesModel.Files[i - startInd].FileName, VideoId = response.VideoId, BinaryContent = files[i - startInd], Content = "" };
           // await _fileRepository.AddAsync(dbFile);
                    }
                }

                if (files.Count > 0)  _vbrickApi.UploadSupplementalFiles(response.VideoId, filesModel, files);
            }

            if (srtFile != null)
                using (var stream = new MemoryStream())
                {
                    await srtFile.CopyToAsync(stream);
                     _vbrickApi.UploadTranscriptionFile(new TranscriptFileModel { Id = response.VideoId, Data = stream.ToArray(), FileName = srtFile.FileName });
                }

            var emails = model.ContactsEmail.Split(';').Where(e => !string.IsNullOrEmpty(e)).Select(e => e.Trim()).ToList();

            emails.Add(model.BusinessOwnerEmail);
            var details = await _vbrickApi.GetVideoDetailsForEdit(response.VideoId);

            foreach (var email in emails)
                try
                {
                    var message = GenerateMessageForFranchiseAsync(details, response.VideoId, CustomKeys.VideoRequestHasBeenReceived, email, null);

                    _logger.LogInformation("Sending 'VideoRequestHasBeenReceived' Email With the following Params");
                    _logger.LogInformation(JsonConvert.SerializeObject(message));

                    await EmailsSender.SendEmail(message);
                }
                catch (Exception ex) { _logger.LogError("Sending Request Email error", ex, response.VideoId); }

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Edit Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UploadVideoResponseModel))]
        [HttpPost]
        [Route("edit-video2/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> EditVideo2(string id)
        {
            var editModel = JsonConvert.DeserializeObject<EditVideoModel>(Request.Form["model"]);
            var file = Request.Form.Files["video"];
            var videoFileReplaced = false;
           await _vbrickApi.SetConfigVBrickApi();
            var srtFile = Request.Form.Files["srt"];
            if (srtFile != null) editModel.SrtFileName = srtFile.FileName;

            if (file != null && file.Length > 0)
            {
                videoFileReplaced = true;
                var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    var model = new ReplaceVideoModel { Data = stream.ToArray(), FileName = fileName };

                    try { await _vbrickApi.ReplaceVideo(id, model); }
                    catch (Exception ex) { _logger.LogError("Replacing video error", ex); }
                }
            }

            await _vbrickApi.EditVideoDetails(editModel, videoFileReplaced);


            //if (editModel.AccessControlEntities != null && editModel.AccessControlEntities.Length > 0)
            //{
            //    await _vbrickApi.EditAccessControl(id, editModel.AccessControlEntities);

            //}


            var thumbnailFile = Request.Form.Files["thumbnail"];

            if (thumbnailFile != null && thumbnailFile.Length > 0)
            {
                var fileName = ContentDispositionHeaderValue.Parse(thumbnailFile.ContentDisposition).FileName.Trim('"');

                using (var stream = new MemoryStream())
                {

                    await thumbnailFile.CopyToAsync(stream);
                    var model = new ReplaceVideoModel {Data = stream.ToArray(), FileName = fileName};
                    _vbrickApi.UploadThumbnail(id, fileName, stream.ToArray());
                }
            }

            var filesModel = new AddSupplementalFilesModel { Files = new List<AddSupplementalFileModel>() };
            var files = new List<byte[]>();

            for (var i = 1; i <= 3; i++)
            {
                var docFile = Request.Form.Files["doc" + i];

                if (docFile != null)
                {
                    var fileName = ContentDispositionHeaderValue.Parse(docFile.ContentDisposition).FileName.Trim('"');
                    filesModel.Files.Add(new AddSupplementalFileModel { FileName = Path.GetFileName(fileName) });

                    using (var stream = new MemoryStream())
                    {
                        await docFile.CopyToAsync(stream);
                        files.Add(stream.ToArray());
            // FST-427 - Reading supplemental files from vbrick and remove linking from OM database
           // var dbFile = new File { Name = filesModel.Files[i - 1].FileName, VideoId = id, BinaryContent = files[i - 1], Content = "" };
           // await _fileRepository.AddAsync(dbFile);
                    }
                }
            }

            if (files.Count > 0)  _vbrickApi.UploadSupplementalFiles(id, filesModel, files);

            if (srtFile == null) return Ok();

            {
                using (var stream = new MemoryStream())
                {
                    await srtFile.CopyToAsync(stream);
                     _vbrickApi.UploadTranscriptionFile(new TranscriptFileModel { Id = id, Data = stream.ToArray(), FileName = srtFile.FileName });
                }
            }

            _memoryCache.Remove(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///   Replace Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPost]
        [Route("replace/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Replace(string id, [FromBody] ReplaceVideoModel model)
        {
            await _vbrickApi.ReplaceVideo(id, model);

            _memoryCache.Remove(id);

            return Ok();
        }


        /// <summary>
        ///   Inactive Videos
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [Route("inactive-videos")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> InactiveVideos([FromQuery] string scrollId)
        {
           await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.InactiveVideos(scrollId);

            return Ok(response);
        }


        /// <summary>
        ///   Videos for Approval
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [ResponseCache(Duration = 60 * 5)]
        [Route("queue-videos")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> VideosForApproval([FromQuery] string scrollId)
        {
           await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.VideosForApproval(scrollId);

            return Ok(response);
        }


        /// <summary>
        ///   MostRecent Videos for Home page
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [ResponseCache(Duration = 5 * 60, VaryByHeader = "franchise")]
        [Route("most-recent")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> MostRecentVideos()
        {
           await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.MostRecentVideos();

            return Ok(response);
        }


        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpPost]
        [Route("search")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Search([FromBody] VideoSearchRequestModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();

            // Fetch data from VBrick API
            var response = await _vbrickApi.SearchVideo(model);

            if (response?.Videos == null || !response.Videos.Any())
            {
                // Return empty response with TotalVideos set to 0
                return Ok(new VideoSearchResponseModel { Videos = new VideoSearchResponseItemModel[] { }, TotalVideos = 0 });
            }

            // Fetch ratings data
            await FetchAndFillRatings(response);

            return Ok(response);
        }



        /// <summary>
        ///   User Videos
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpPut]
        [Route("user-videos")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> UserVideos([FromBody] ManageVideoModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetUserVideos(model);

            return Ok(response);
        }


        /// <param name="scrollId"> </param>
        /// <summary>
        ///   Private Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [ResponseCache(Duration = 20)]
        [Route("private-videos")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> PrivateVideos([FromQuery] string scrollId)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.SearchPrivateVideos(scrollId);

            return Ok(response);
        }


        /// <param name="scrollId"> </param>
        /// <summary>
        ///   Archived Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [ResponseCache(Duration = 20)]
        [Route("archives")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Archives([FromQuery] string scrollId)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetArchivedVideos(scrollId);

            return Ok(response);
        }


        /// <summary>
        ///   UserVideos Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [Route("top-featured")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> TopFeatured(bool showAll)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetTopFeaturedVideos(showAll);

            return Ok(response);
        }


        /// <summary>
        ///   UserVideos Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpGet]
        [Route("top-videos")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> TopVideos(string scrollId)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetTopVideos(scrollId);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Reject Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel))]
        [HttpPut]
        [Route("reject/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Reject(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.RejectVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Video Status
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoStatusModel))]
        [HttpGet]
        [Route("status/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Status(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetVideoStatus(id);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Video Status
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoPlaybackUrlResponseModel))]
        [HttpGet]
        [ResponseCache(Duration = 60 * 5)]
        [Route("playback-url/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetPlaybackUrl(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();

            return Ok(await _vbrickApi.GetPlaybackUrl(id));

        }


        /// <summary>
        ///   Videos list
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideosListModel))]
        [HttpGet]
        [ResponseCache(Duration = 60 * 5)]
        [Route("list")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> List()
        {
           await _vbrickApi.SetConfigVBrickApi();

            return Ok(await _vbrickApi.GetVideos());
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Video Report
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoReportModel[]))]
        [HttpPost]
        [Route("report")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Report([FromBody] VideoReportQueryModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetVideoReport(model);

            return Ok(response);
        }


        /// <summary>
        ///   Videos count
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(int))]
        [HttpGet]
        [ResponseCache(Duration = 5 * 60 * 60)]
        [Route("videos-count")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> VideosCount()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetVideosCount();

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Video Fields
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoFieldModel[]))]
        [HttpGet]
        [Route("fields")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Fields([FromBody] VideoReportQueryModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetVideoFields();

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Video Embedding Code
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoEmbeddingModel))]
        [HttpPost]
        [Route("embedding")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Embedding([FromBody] VideoEmbeddingQueryModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetVideoEmbedInfo(model);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Video Details
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoDetailsModel))]
        [HttpGet]
        [ResponseCache(Duration = 60 * 5)]
        [Route("details/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Details(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();

            var response = await _vbrickApi.GetVideoDetails(id);
            var video = await _videoRatingRepository.FindAsync(v => v.VideoId == id);

            if (video == null) return Ok(response);

            response.Rating = video.AvgRating;
            response.TotalRatings = _ratingRepository.GetTotalRatings(id);

            return Ok(response);
        }


        /// <summary>
        /// Video Details
        /// </summary>
        /// <param name="model">Flagged details request model</param>
        /// <returns>Video details</returns>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoDetailsModel))]
        [HttpPut("details-flagged")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> DetailsFlagged([FromBody] FlaggedDetailsRequestModel model)
        {
            try
            {
                await _vbrickApi.SetConfigVBrickApi();

#if DEBUG
                model.UserName = "api1@fordtube.com";
#endif
                // Try to get video details from cache
                if (!_memoryCache.TryGetValue(model.Id, out VideoDetailsModel videoDetailsResponse))
                {
                    videoDetailsResponse = await _vbrickApi.GetVideoDetails(model.Id);

                    if (videoDetailsResponse == null)
                    {
                        _logger.LogError("Unable to get details for video.");
                        return BadRequest("Unable to get details for video.");
                    }

                    // Set cache options
                    var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(30));

                    // Save data in cache
                    _memoryCache.Set(model.Id, videoDetailsResponse, cacheEntryOptions);
                }

                var videoRating = await _videoRatingRepository.FindAsync(v => v.VideoId == model.Id).ConfigureAwait(false);

                if (videoRating != null)
                {
                    videoDetailsResponse.Rating = videoRating.AvgRating;
                    videoDetailsResponse.TotalRatings = _ratingRepository.GetTotalRatings(videoRating.VideoId);
                    videoDetailsResponse.RatingByUser = _ratingRepository.GetRatingByUser(videoRating.VideoId, model.UserName);
                }
                else
                {
                    videoDetailsResponse.Rating = 0;
                    videoDetailsResponse.TotalRatings = 0;
                    videoDetailsResponse.RatingByUser = 0;
                }

                var flaggedResponse = await _reportRepository.FindByAsync(r => r.VideoId == model.Id && r.UserName == model.UserName).ConfigureAwait(false);

                videoDetailsResponse.Flagged = flaggedResponse.Count > 0;

                videoDetailsResponse.IsDealer = videoDetailsResponse.UploadedBy != "Ford Official"
                                           && videoDetailsResponse.UploadedBy != "Official Video"
                                           && videoDetailsResponse.UploadedBy != "Migration User";


                return Ok(videoDetailsResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to set/get data to build response.");
                return StatusCode((int)HttpStatusCode.InternalServerError, "Failed to set/get data to build response.");
            }
        }




        /// <param name="id"> </param>
        /// <summary>
        ///   Video Details For Edit
        /// </summary>
        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(VideoDetailsModel))]
        [HttpGet]
        [ResponseCache(Duration = 10)]
        [Route("details-for-edit/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> DetailsForEdit(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();

            var response = await _vbrickApi.GetVideoDetailsForEdit(id);
            var video = await _videoRatingRepository.FindAsync(v => v.VideoId == id);

            if (video != null)
            {
                response.Rating = video.AvgRating;
                response.TotalRatings = _ratingRepository.GetTotalRatings(id);
            }
            // FST-427 - Reading supplemental files from vbrick and remove linking from OM database
            //response.Files = _fileRepository.FindBy(f => f.VideoId == id).Select(f => new AttachedFileModel { Id = f.Id, Name = f.Name }).ToList();

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Get Attached File
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(FileContentResult))]
        [HttpGet]
        [Route("attached-file/{id}")]
        [Obsolete]
        public async Task<IActionResult> GetAttachedFile(int id)
        {
            var file = await _fileRepository.FindAsync(f => f.Id == id);

            return File(file.BinaryContent, "application/octet-stream", file.Name);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Get Attached File
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(FileContentResult))]
        [HttpPut]
        [Route("remove-file/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [Obsolete]
        public async Task<IActionResult> RemoveAttachedFile(int id)
        {
            var file = await _fileRepository.FindAsync(f => f.Id == id);
            await _fileRepository.DeleteAsync(file);

            return Ok();
        }

        /// <summary>
        /// Downloads the supplemental files from Vbrick REV platform based upon the video id and file id.
        /// </summary>
        /// <param name="videoid">The video identifier.</param>
        ///  <param name="fileid">The file identifier.</param>
        /// <returns>Task&lt;FileStreamResult&gt;.</returns>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(byte[]))]
        [HttpGet]
        [Route("{videoid}/downloadfile/{fileid}")]
        public async Task<FileStreamResult> DownloadSupplementalFile(string videoid, string fileid, [FromQuery] string fileName)
        {            
            await _vbrickApi.SetConfigVBrickApi();

            string url = string.Format(new RevApiUrls(_configuration["VBrickSettings:BaseUrl"]).DownloadSupplimentalFilesUrl, videoid, fileid);
            var asyncStreamFromVbrick = await _vbrickApi.DownloadFileStream(url);
            return new FileStreamResult(asyncStreamFromVbrick, "application/octet-stream") { FileDownloadName = fileName};
        }      


        /// <param name="id"> </param>
        /// <summary>
        ///   Returns VBrick Video ID by inner ID
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        [HttpGet]
        [ResponseCache(Duration = 5 * 60, VaryByQueryKeys = new[] { "id" })]
        [Route("id/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetId(string id)
        {
            var result = await _videoRepository.FindAsync(v => v.VideoKey == id);

            return Ok(result == null ? id : result.VbrickId);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Video Comments
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(CommentModel))]
        [HttpGet]
        [ResponseCache(NoStore = true, Duration = 0)]
        [Route("comments/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Comments(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetVideoComments(id);

            return Ok(response);
        }


        /// <summary>
        ///   Pending Videos
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(CommentModel))]
        [HttpGet]
        [Route("pending")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Pendings()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetPendingVideos();

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///   Add Video Ratings
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("rating/{id}")]
        [ResponseCache(Duration = 5 * 60, VaryByQueryKeys = new[] { "id" })]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Rating(string id, [FromBody] EditRatingModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await AddRatingHelper(id, model);

            _memoryCache.Remove(id);

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Add Video Ratings
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPost]
        [Route("make-featured")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> MakeVideoFeatured([FromBody] MakeVideoFeaturedModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.MakeVideoFeatured(model);

            return Ok();
        }


        /// <param name="model"> </param>
        /// <summary>
        ///   Edit Video Details
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPost]
        [Route("edit-details")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> EditDetails([FromBody] EditVideoModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.EditVideoDetails(model, false);

            _memoryCache.Remove(model.Id);


            return Ok();
        }


        /// <summary>
        /// Downloads the specified video file from Vbrick REV platform based upon the video identifier.
        /// </summary>
        /// <param name="id">The video identifier.</param>
        /// <returns>Task&lt;FileStreamResult&gt;.</returns>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(byte[]))]
        [HttpGet]
        [Route("download/{id}")]
        public async Task<FileStreamResult> Download(string id)
        {

            const SslProtocols _Tls12 = (SslProtocols)0x00000C00;
            const SecurityProtocolType Tls12 = (SecurityProtocolType)_Tls12;
            ServicePointManager.SecurityProtocol = Tls12;


            //var httpClient = new HttpClient
            //{
            //    Timeout = System.Threading.Timeout.InfiniteTimeSpan,
            //    MaxResponseContentBufferSize = 1
            //};

            await _vbrickApi.SetConfigVBrickApi();


           
            //httpClient.DefaultRequestHeaders.Add("User-Agent", Request.Headers["User-Agent"].ToString());
            //httpClient.DefaultRequestHeaders.Add("Connection", "keep-alive");
            //httpClient.DefaultRequestHeaders.Add("Pragma", "no-cache");
            //httpClient.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
            //httpClient.DefaultRequestHeaders.Add("Accept", "application/json, text/plain, */*");
            //httpClient.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate, br");
            //httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");

            //Response.Headers.TryAdd("Connection", "keep-alive");

            // var asyncStreamFromVbrick = await httpClient.GetStreamAsync(string.Format(new RevApiUrls(_configuration["VBrickSettings:BaseUrl"]).DownloadVideoUrl, id));
            string url = string.Format(new RevApiUrls(_configuration["VBrickSettings:BaseUrl"]).DownloadVideoUrl, id);
            var asyncStreamFromVbrick = await _vbrickApi.DownloadFileStream(url);
            return new FileStreamResult(asyncStreamFromVbrick, "application/octet-stream") { FileDownloadName = id + ".mp4" };
        }



        /// <summary>
        ///   Get Archived Videos CSV
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        [HttpGet]
        [Route("archive-csv")]
        public async Task<IActionResult> GetArchiveCsv()
        {
            string scrollId = null;
            VideoSearchResponseModel response;
            var file = new StringBuilder();
            var totalCount = 0;
            await _vbrickApi.SetConfigVBrickApi();

            do
            {
                response = await _vbrickApi.GetArchivedVideos(scrollId);
                totalCount += response.Videos.Length;
                scrollId = response.ScrollId;
                foreach (var video in response.Videos) file.AppendLine($"{video.Id},{video.Title},{video.UploadedBy},{video.WhenUploaded},{video.Duration}");
            }
            while (totalCount < response.TotalVideos);

            return File(Encoding.UTF8.GetBytes(file.ToString()), "text/csv", "archive.csv");
        }


        /// <summary>
        ///   Get Video Requests CSV
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(FileResult))]
        [HttpGet]
        [Route("queue-csv/")]
        public async Task<FileResult> GetQueueCsv([FromQuery] DownloadCsvModel model)
        {
            string scrollId = null;
            VideoSearchResponseModel response;
            var file = new StringBuilder();

            file.AppendLine("Id,Restricted Access, Status,Upload Video Later,Franchise,Enable Downloads,Title,Description,Tags,PartOfSeries,Uploaded By,When Uploaded,Duration,Business Owner Name,Business Owner Email,Contacts Email,Notes,Expiration Date,Publish Date,Modified Date,Categories,Files");

            var totalCount = 0;

           await _vbrickApi.SetConfigVBrickApi();

            _vbrickApi.Franchise = model.Franchise == 0 ? FranchiseType.Ford : FranchiseType.Both;

            do
            {

                response = await _vbrickApi.SearchVideo(new VideoSearchRequestModel
                {
                    ScrollId = scrollId,
                    Status = VideoStatus.All,
                    SortDirection = SortDirectionType.Desc,
                    SortField = SortFieldType.WhenUploaded,
                    ToUploadDate = model.ToUploadDate,
                    FromUploadDate = model.FromUploadDate
                });

                totalCount += response.Videos.Length;

                scrollId = response.ScrollId;

                foreach (var video in response.Videos)
                    try
                    {
            // FST-427 - Reading supplemental files from vbrick abd remove linking from OM database
           //var files = string.Join(';', _fileRepository.FindBy(f => f.VideoId.Equals(video.Id)).Select(f => f.Name).ToArray());
                        var details = await _vbrickApi.GetVideoDetailsForEdit(video.Id);

                        var status = details.IsPendingApproval ? "Pending" : details.IsRejected ? "Rejected" : details.IsAdmin ? "Admin" : details.IsOfficial ? "Approved" : "Unofficial";

                        var categories = string.Join(';', details.CategoryPaths.Select(c => c.FullPath).ToArray());
            var files = string.Join(';', details.SupplementalFiles.Select(c => c.FileName).ToArray());
                        var uploadLaterStatus = details.Categories.Contains( _vbrickApi.GetMappedId(VbrickMappingsType.UploadLaterCategoryId)) ? "Upload Later" : "Video is Uploaded";
                        var restrictedAccess = details.VideoAccessControl == "Private" ? "Yes" : "No";

                        var line =
                          $"{video.Id},{restrictedAccess},{status},{uploadLaterStatus},{details.Franchise},{details.EnableDownloads},\"{video.Title}\",\"{video.Description}\",\"{string.Join(';', video.Tags)}\",{video.PartOfSeries},\"{video.UploadedBy}\",{details.WhenUploaded},\"{video.Duration}\",\"{details.BusinessOwnerName}\",\"{details.BusinessOwnerEmail}\",\"{details.ContactsEmail}\",\"{details.Notes}\",{details.ExpirationDate},{details.PublishDate},{video.WhenModified},\"{categories}\",\"{files}\"";

                        file.AppendLine(line.Replace("\r", " ").Replace("\n", " "));
                    }
                    catch (Exception ex) { _logger.LogError("CSV Error. Video ID: {0} Error: {1}", video.Id, ex.ToString()); }
            }
            while (totalCount < response.TotalVideos);

            return new FileContentResult(Encoding.UTF8.GetBytes(file.ToString()), "text/csv");
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Approve Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("approve/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Approve(string id)
        {
           await _vbrickApi.SetConfigVBrickApi();
            var details = await _vbrickApi.GetVideoDetailsForEdit(id);
            await _vbrickApi.ApproveVideoRequest(id, details.PublishDate == null || details.PublishDate.Value.Date <= DateTime.Now.Date);

            var emails = new List<string>();

            var ownerEmailId =  _vbrickApi.GetMappedId(VbrickMappingsType.OwnerEmailId);
            var contactsEmailId =  _vbrickApi.GetMappedId(VbrickMappingsType.ContactsEmailId);

            var emailField = details.CustomFields.FirstOrDefault(f => f.Id == ownerEmailId);

            if (emailField != null && !string.IsNullOrEmpty(emailField.Value)) emails.Add(emailField.Value);
            var emailField2 = details.CustomFields.FirstOrDefault(f => f.Id == contactsEmailId);

            if (emailField != null && emailField2 != null && !string.IsNullOrEmpty(emailField.Value))
                emails.AddRange(emailField2.Value.Split(';').Where(e => !string.IsNullOrEmpty(e)).Select(e => e.Trim()).ToList());

            foreach (var email in emails)
                try
                {
                    var message = GenerateMessageForFranchiseAsync(details, id, CustomKeys.VideoHasBeenPublished, email, null);

                    _logger.LogInformation("Sending 'VideoHasBeenPublished' Email With the following Params");
                    _logger.LogInformation(JsonConvert.SerializeObject(message));

                    await EmailsSender.SendEmail(message);
                }
                catch (Exception ex) { _logger.LogError("Approving Request Email error", ex, id); }

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Reject Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("reject-request/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> RejectRequest(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.RejectVideoRequest(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Approve Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("delete-request/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> DeleteRequest(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteVideoRequest(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///   Add Video Report
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("add-report/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> AddReport(string id, [FromBody] ReportModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
#if DEBUG
            model.UserName = "aivanov2@MarketingAssociates.com";
#endif
            var user = await _vbrickApi.GetUserByUserName(model.UserName);
            model.Name = string.Format($"{user.FirstName} {user.LastName}");

            var report = new Report
            {
                CreatedOn = DateTime.Now,
                UpdatedOn = DateTime.Now,
                VideoId = id,
                UserName = model.UserName,
                Comment = model.Comment,
                Name = model.Name
            };

            await _reportRepository.AddAsync(report);

           await _vbrickApi.FlagVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Get Video Reports
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(ReportModel[]))]
        [HttpGet]
        [Route("get-reports/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public IActionResult GetReports([FromQuery] string id)
        {
            var reports = _reportRepository.FindBy(r => r.VideoId == id && !r.Reviewed)
                                           .Select(r => new ReportModel { Id = r.Id, Comment = r.Comment, UserName = r.UserName, CreatedOn = r.CreatedOn })
                                           .ToList();

            return Ok(reports);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Archive Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("archive/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Archive(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.ArchiveVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Unarchive Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("unarchive/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Unarchive(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
           await _vbrickApi.UnarchiveVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Flag Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("flag/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Flag(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.FlagVideo(id);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///   Unflag Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("unflag/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [AuthorizeUserRole(UserRoleEnum.SUPER_ADMIN)]
        public async Task<IActionResult> Unflag(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.UnflagVideo(id);
            var reports = await _reportRepository.FindByAsync(r => r.VideoId == id);

            foreach (var report in reports)
            {
                report.Reviewed = true;
                await _reportRepository.UpdateAsync(report, report.Id);
            }

            return Ok();
        }


        /// <param name="scrollId"> </param>
        /// <summary>
        ///   Flagged Video
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(FlaggedVideoModel))]
        [HttpGet]
        [ResponseCache(Duration = 60 * 5)]
        [Route("flagged")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Flagged([FromQuery] string scrollId)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetFlaggedVideos(scrollId);

            var result = new FlaggedVideoModel
            {
                Videos = response.Videos.Select(v => new FlaggedVideoItemModel { Video = v }).ToList(),
                TotalVideos = response.TotalVideos,
                ScrollId = response.ScrollId
            };

           // var reports = await _reportRepository.FindByAsync(r => !r.Reviewed && response.Videos.Any(rv => rv.Id == r.VideoId));
            var reports = await _reportRepository.FindByAsync(r => !r.Reviewed);

            result.Videos.ForEach(v => v.Reports = reports.Where(r => r.VideoId == v.Video.Id)
                                                          .Select(r => new ReportModel
                                                          {
                                                              Id = r.Id,
                                                              VideoId = r.VideoId,
                                                              Comment = r.Comment,
                                                              CreatedOn = r.CreatedOn,
                                                              Reviewed = true,
                                                              UserName = r.UserName,
                                                              Name = r.Name
                                                          })
                                                          .ToList());

            return Ok(result);
        }


        #region Helpers

        private static string GenerateCacheKey(VideoSearchRequestModel model, FranchiseType franchise)
        {
            if (!string.IsNullOrWhiteSpace(model.Query) || !string.IsNullOrWhiteSpace(model.ScrollId))
            {
                // No caching for requests with a search query or ScrollId
                return null;
            }

            // Generate a unique cache key based on relevant properties of the model, excluding query and ScrollId
            return $"{franchise}_{model.SortField}_{string.Join(",", model.Categories)}_{model.SortDirection}_{model.SearchField}";
        }


        private EmailMessage GenerateMessageForFranchiseAsync(VideoDetailsModel model, string videoId, CustomKeys customerKey, string toEmail, string comment)
        {
            var message = new EmailMessage { CustomerKey = customerKey, ToEmail = toEmail, VideoTitle = model.Title };

            if (!comment.IsNullOrEmpty()) message.Comment = comment;

            switch (model.Franchise)
            {
                case FranchiseType.Both:
                    message.VideoLink = string.Format(_configuration.GetSection("VideoUrl").Value, videoId);
                    message.VideoLink2 = string.Format(_configuration.GetSection("LincolnVideoUrl").Value, videoId);

                    break;

                case FranchiseType.Ford:
                    message.VideoLink = string.Format(_configuration.GetSection("VideoUrl").Value, videoId);

                    break;

                case FranchiseType.Lincoln:
                    message.VideoLink = string.Format(_configuration.GetSection("LincolnVideoUrl").Value, videoId);

                    break;
            }

            return message;
        }


        private async Task<CommentModel> AddCommentHelper(string id, AddCommentModel model)
        {
            if (model.Comment.IsNullOrEmpty()) return await _vbrickApi.GetVideoComments(id);

            await _vbrickApi.AddVideoComment(id, model);
            var details = await _vbrickApi.GetVideoDetailsForEdit(id);

            var emails = new List<string>();
            var ownerEmailId =  _vbrickApi.GetMappedId(VbrickMappingsType.OwnerEmailId);
            var contactsEmailId =  _vbrickApi.GetMappedId(VbrickMappingsType.ContactsEmailId);

            var emailField = details.CustomFields.FirstOrDefault(f => f.Id == ownerEmailId);
            if (emailField != null && !string.IsNullOrEmpty(emailField.Value)) emails.Add(emailField.Value);
            var emailField2 = details.CustomFields.FirstOrDefault(f => f.Id == contactsEmailId);

            if (emailField != null && emailField2 != null && !string.IsNullOrEmpty(emailField.Value))
                emails.AddRange(emailField2.Value.Split(';').Where(e => !string.IsNullOrEmpty(e)).Select(e => e.Trim()).ToList());

            foreach (var email in emails)
                try
                {
                    var message = GenerateMessageForFranchiseAsync(details, id, CustomKeys.NewComment, email, model.Comment);

                    _logger.LogInformation("Sending 'NewComment' Email With the following Params");
                    _logger.LogInformation(JsonConvert.SerializeObject(message));

                    await EmailsSender.SendEmail(message);
                }
                catch (Exception ex) { _logger.LogError("Add Comments Email error", ex, id); }

            return await _vbrickApi.GetVideoComments(id);
        }


        private async Task<AddRatingResponseModel> AddRatingHelper(string id, EditRatingModel model)
        {
            var jsonSettings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                DefaultValueHandling = DefaultValueHandling.Ignore
            };

            var postModelJson = JsonConvert.SerializeObject(new
            {
                rating = model.Rating,
                videoId = model.VideoId
            }, jsonSettings);

            var postModel = JsonConvert.DeserializeObject<EditRatingModel>(postModelJson);

            // Post to Rev API excluding UserName
            await _vbrickApi.EditVideoRating(id, postModel);

            decimal newAverageRating;

            var rating = await _ratingRepository.FindAsync(r => r.VideoId == id && r.UserId == User.Identity.Name);

            if (rating == null)
            {
                if (User.Identity != null) await _ratingRepository.AddAsync(new Rating { VideoId = id, Value = Convert.ToDecimal(model.Rating), UserId = User.Identity.Name });
            }
            else
            {
                rating.Value = Convert.ToDecimal(model.Rating);

                await _ratingRepository.UpdateAsync(rating, rating.Id);
            }

            var videoRating = await _videoRatingRepository.FindAsync(v => v.VideoId == id);

            if (videoRating == null)
            {
                var franchise      = await _vbrickApi.GetVideoFranchise(id);
                var addAsyncResult = await _videoRatingRepository.AddAsync(new VideoRating { VideoId = id, AvgRating = Convert.ToDecimal(model.Rating), Franchise = (int)franchise });

                newAverageRating = addAsyncResult.AvgRating;
            }
            else
            {
                var ratings = await _ratingRepository.FindByAsync(r => r.VideoId == id);
                videoRating.AvgRating = ratings.Sum(r => r.Value) / ratings.Count;
                var updateAsyncResult = await _videoRatingRepository.UpdateAsync(videoRating, videoRating.Id);

                newAverageRating = updateAsyncResult.AvgRating;
            }

            return new AddRatingResponseModel
            {
                AverageRating = newAverageRating,
                TotalRatings = _ratingRepository.GetTotalRatings(id)
            };
        }


        private void FillRatings(IEnumerable<VideoSearchResponseItemModel> videos, Dictionary<string, int> totalRatingsDict, Dictionary<string, decimal> averageRatingsDict)
        {
            foreach (var video in videos)
            {
                video.RatingsCount = totalRatingsDict.ContainsKey(video.Id) ? totalRatingsDict[video.Id] : 0;
                video.AverageRating = averageRatingsDict.ContainsKey(video.Id) ? (float) averageRatingsDict[video.Id] : 0;
            }
        }


        private async Task FetchAndFillRatings(VideoSearchResponseModel response)
        {
            var videoIds = response.Videos.Select(v => v.Id).ToList();

            // Fetch necessary ratings data in parallel using separate DbContext instances
            var totalRatingsTask   = _ratingRepository.GetTotalRatingsForVideosAsync(videoIds);
            var averageRatingsTask = _ratingRepository.GetAverageRatingsForVideosAsync(videoIds);

            await Task.WhenAll(totalRatingsTask, averageRatingsTask);

            var totalRatingsDict   = totalRatingsTask.Result;
            var averageRatingsDict = averageRatingsTask.Result;

            FillRatings(response.Videos, totalRatingsDict, averageRatingsDict);
        }


        #endregion

    }

}