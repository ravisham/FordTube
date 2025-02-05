---
title: Playlist Management
---
# Introduction

This document will walk you through the Playlist Management feature in the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="16:2:2" line-data="namespace FordTube.WebApi.Controllers">`FordTube`</SwmToken> application. The purpose of this feature is to provide an API for managing playlists, including operations such as retrieving, adding, deleting, and managing playlists and featured videos.

We will cover:

1. The structure and purpose of the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="23:5:5" line-data="    public class PlaylistController : ControllerBase">`PlaylistController`</SwmToken>.
2. The use of repositories for interacting with the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API.
3. The implementation of various playlist management endpoints.

# <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="23:5:5" line-data="    public class PlaylistController : ControllerBase">`PlaylistController`</SwmToken> structure

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="16">

---

The <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="23:5:5" line-data="    public class PlaylistController : ControllerBase">`PlaylistController`</SwmToken> is defined as an API controller that handles playlist-related operations. It is configured to produce JSON responses and supports CORS for cross-origin requests.

```
namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class PlaylistController : ControllerBase
    {
```

---

</SwmSnippet>

# Dependency injection

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="27">

---

The controller uses dependency injection to access the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="27:5:5" line-data="        private readonly IVbrickMappingRepository _mappingRepository;">`IVbrickMappingRepository`</SwmToken> and <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="30:5:5" line-data="        private readonly IVBrickApiRepository _vbrickApi;">`IVBrickApiRepository`</SwmToken>. These repositories are crucial for interacting with the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API, which handles the actual playlist operations.

```
        private readonly IVbrickMappingRepository _mappingRepository;


        private readonly IVBrickApiRepository _vbrickApi;
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="33">

---

The constructor initializes these dependencies, ensuring that the controller has access to the necessary methods for managing playlists.

```
        public PlaylistController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            
            _mappingRepository = mappingRepository;
            
            _vbrickApi = vbrickApi;
        }
```

---

</SwmSnippet>

# Retrieving playlists

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="41">

---

The <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="42:3:3" line-data="        ///     Get existing playlists">`Get`</SwmToken> method is responsible for retrieving existing playlists. It first configures the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API and then calls the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="51:11:11" line-data="            var response = await _vbrickApi.GetPlaylists();">`GetPlaylists`</SwmToken> method to fetch the playlists. This method is secured with basic authentication.

```
        /// <summary>
        ///     Get existing playlists
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(PlaylistDetailsModel))]
        [HttpGet]
        [Route("get")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Get()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetPlaylists();
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="53">

---

The response is returned with an HTTP 200 status code, indicating a successful operation.

```
            return Ok(response);
        }
```

---

</SwmSnippet>

# Adding playlists

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="57">

---

The <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="59:3:3" line-data="        ///     Add playlist">`Add`</SwmToken> method allows for the addition of new playlists. It accepts a model containing the playlist details, configures the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API, and then calls the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="68:11:11" line-data="            var response = await _vbrickApi.AddPlaylist(model);">`AddPlaylist`</SwmToken> method to create the playlist.

```
        /// <param name="model"> </param>
        /// <summary>
        ///     Add playlist
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Add([FromBody] AddPlaylistRequestModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddPlaylist(model);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="53">

---

The result of the operation is returned with an HTTP 200 status code.

```
            return Ok(response);
        }
```

---

</SwmSnippet>

# Deleting playlists

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="74">

---

The <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="76:3:3" line-data="        ///     Delete playlist">`Delete`</SwmToken> method provides functionality to remove a playlist by its ID. It configures the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API and calls the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="85:5:5" line-data="            await _vbrickApi.DeletePlaylist(id);">`DeletePlaylist`</SwmToken> method to perform the deletion.

```
        /// <param name="id"> </param>
        /// <summary>
        ///     Delete playlist
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpDelete]
        [Route("delete/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Delete(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeletePlaylist(id);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="87">

---

A successful deletion returns an HTTP 200 status code.

```
            return Ok();
        }
```

---

</SwmSnippet>

# Managing playlists

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="91">

---

The <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="94:3:3" line-data="        ///     Manage playlist">`Manage`</SwmToken> method is used to update the videos within a playlist. It takes a playlist ID and a model with the video details, configures the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API, and calls the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="103:5:5" line-data="            await _vbrickApi.ManagePlaylist(id, model);">`ManagePlaylist`</SwmToken> method.

```
        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///     Manage playlist
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpDelete]
        [Route("manage/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Manage(string id, [FromBody] ManagePlaylistVideosModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.ManagePlaylist(id, model);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="87">

---

The operation concludes with an HTTP 200 status code.

```
            return Ok();
        }
```

---

</SwmSnippet>

# Managing featured videos

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="109">

---

The <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="117:10:10" line-data="        public async Task&lt;IActionResult&gt; ManageFeatured([FromBody] ManagePlaylistVideosModel model)">`ManageFeatured`</SwmToken> method is similar to the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="111:3:3" line-data="        ///     Manage featured videos">`Manage`</SwmToken> method but focuses on managing featured videos. It accepts a model with the video details, configures the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API, and calls the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="120:5:5" line-data="            await _vbrickApi.ManageFeaturedList(model);">`ManageFeaturedList`</SwmToken> method.

```
        /// <param name="model"> </param>
        /// <summary>
        ///     Manage featured videos
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpDelete]
        [Route("manage-featured")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> ManageFeatured([FromBody] ManagePlaylistVideosModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.ManageFeaturedList(model);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/PlaylistController.cs" line="122">

---

The method returns an HTTP 200 status code upon successful completion.

```
            return Ok();
        }

    }

}
```

---

</SwmSnippet>

This walkthrough highlights the design decisions and implementation details of the Playlist Management feature, focusing on how the controller interacts with the <SwmToken path="/FordTube.WebApi/Controllers/PlaylistController.cs" pos="6:4:4" line-data="using FordTube.VBrick.Wrapper;">`VBrick`</SwmToken> API to perform various playlist operations.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBRm9yZFR1YmUlM0ElM0FyYXZpc2hhbQ==" repo-name="FordTube"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
