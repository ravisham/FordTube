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
    public class ConferencesBaseController : ControllerBase
    {
        private readonly IVbrickMappingRepository _mappingRepository;

        private readonly IVBrickApiRepository _vbrickApi;


        public ConferencesBaseController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            _mappingRepository = mappingRepository;
            _vbrickApi = vbrickApi;
        }

        /// <param name="model"> </param>
        /// <summary>
        ///     Start Conference Recording
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("start-recording")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> StartRecording([FromBody] StartRecordingModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.StartRecording(model);

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///     Stop Conference Recording
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("stop-recording")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> StopRecording([FromBody] RecordingModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.StopRecording(model);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///     Status of Conference Recording
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpGet]
        [Route("status/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Status(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetRecordingStatus(id);

            return Ok(response);
        }

    }

}