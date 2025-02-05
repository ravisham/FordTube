// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Net;
using System.Threading.Tasks;
using FordTube.VBrick.Wrapper;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OneMagnify.Data.Ford.FordTube.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class PlaylistController : ControllerBase
    {


        private readonly IVbrickMappingRepository _mappingRepository;


        private readonly IVBrickApiRepository _vbrickApi;


        public PlaylistController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            
            _mappingRepository = mappingRepository;
            
            _vbrickApi = vbrickApi;
        }

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

            return Ok(response);
        }


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

            return Ok(response);
        }


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

            return Ok();
        }


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

            return Ok();
        }


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

            return Ok();
        }

    }

}