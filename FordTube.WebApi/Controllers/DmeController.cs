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

using OneMagnify.Data.Ford.FordTube.Repositories;

using Swashbuckle.AspNetCore.Annotations;


namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class DmeController : ControllerBase
    {



        private readonly IVbrickMappingRepository _mappingRepository;

        private readonly IVBrickApiRepository _vbrickApi;

        public DmeController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            _mappingRepository = mappingRepository;
            _vbrickApi = vbrickApi;
        }

        /// <summary>
        ///     List of DME Devices
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(DmeDevicesModel))]
        [HttpGet]
        [Route("list")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> List()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetDmeDevices();

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///     Add DME Device
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Add([FromBody] AddDmeModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddDmeDevice(model);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///     Delete DME Device
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("delete")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Delete(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteDme(id);

            return Ok();
        }

    }

}