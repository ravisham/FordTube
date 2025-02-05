---
title: Video Management
---
# Introduction

This document will walk you through the implementation of the endpoints for the video management<SwmPath>[FordTube.WebApi/Controllers/VideoController.cs](/FordTube.WebApi/Controllers/VideoController.cs)</SwmPath>. The purpose of this implementation is to manage video operations such as uploading, editing, and retrieving video details through various API endpoints.

We will cover:

1. How the controller is structured and initialized.
2. The role of the <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="8:4:4" line-data="using FordTube.VBrick.Wrapper.Enums;">`VBrick`</SwmToken> API in video operations.
3. The handling of video uploads and associated data.
4. The management of video metadata and user interactions.

# Controller structure and initialization

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="26">

---

The <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="36:5:5" line-data="    public class VideoController : ControllerBase">`VideoController`</SwmToken> is defined as an API controller with CORS and JSON response settings. It is initialized with several dependencies that are crucial for its operations, including repositories, logger, configuration, and memory cache.

```
namespace FordTube.WebApi.Controllers
{

    using System.Security.Authentication;


    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class VideoController : ControllerBase
    {
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="57">

---

The constructor initializes these dependencies, which are used throughout the controller to interact with the database, manage caching, and log operations.

```
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
```

---

</SwmSnippet>

# <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="8:4:4" line-data="using FordTube.VBrick.Wrapper.Enums;">`VBrick`</SwmToken> API integration

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="86">

---

The <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="8:4:4" line-data="using FordTube.VBrick.Wrapper.Enums;">`VBrick`</SwmToken> API is central to the controller's functionality, providing methods to manage video states and data. Each endpoint typically begins by configuring the <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="8:4:4" line-data="using FordTube.VBrick.Wrapper.Enums;">`VBrick`</SwmToken> API, ensuring it is ready for the subsequent operations.

```
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
```

---

</SwmSnippet>

# Video upload and data handling

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="252">

---

The controller supports multiple video upload methods, each tailored for different scenarios such as dealer uploads or admin uploads. These methods handle file data, set video metadata, and manage additional files like subtitles.

```
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
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="298">

---

The <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="307:10:10" line-data="        public async Task&lt;IActionResult&gt; Upload2()">`Upload2`</SwmToken> method, for example, processes video files and optional subtitle files, demonstrating how the controller manages multipart form data and interacts with the <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="8:4:4" line-data="using FordTube.VBrick.Wrapper.Enums;">`VBrick`</SwmToken> API to upload videos.

```
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
```

---

</SwmSnippet>

# Managing video metadata and user interactions

Endpoints are provided for managing video metadata, such as adding comments, ratings, and handling video status changes. These operations often involve updating the cache and notifying users via email.

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="137">

---

The <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="146:10:10" line-data="        public async Task&lt;IActionResult&gt; AddComment(string id, [FromBody] AddCommentModel model)">`AddComment`</SwmToken> endpoint illustrates how comments are added to a video, with the cache being updated and notifications sent to relevant users.

```
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
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/VideoController.cs" line="1639">

---

The <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="1639:10:10" line-data="        private async Task&lt;AddRatingResponseModel&gt; AddRatingHelper(string id, EditRatingModel model)">`AddRatingHelper`</SwmToken> method is a helper function that updates video ratings, demonstrating the interaction with the rating repository and the calculation of average ratings.

```
        private async Task<AddRatingResponseModel> AddRatingHelper(string id, EditRatingModel model)
        {
            var jsonSettings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                DefaultValueHandling = DefaultValueHandling.Ignore
            };
```

---

</SwmSnippet>

# Conclusion

The "Video End Points" implementation in <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="36:5:5" line-data="    public class VideoController : ControllerBase">`VideoController`</SwmToken> is designed to efficiently manage video operations through a structured approach, leveraging the <SwmToken path="/FordTube.WebApi/Controllers/VideoController.cs" pos="8:4:4" line-data="using FordTube.VBrick.Wrapper.Enums;">`VBrick`</SwmToken> API and various repositories. This setup ensures that video data is handled correctly, user interactions are managed, and system performance is optimized through caching and logging.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBRm9yZFR1YmUlM0ElM0FyYXZpc2hhbQ==" repo-name="FordTube"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
