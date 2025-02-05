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
    public class ZonesController : ControllerBase
    {


        private readonly IVbrickMappingRepository _mappingRepository;


        private readonly IVBrickApiRepository _vbrickApi;


        public ZonesController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            
            _mappingRepository = mappingRepository;
            
            _vbrickApi = vbrickApi;
        }

        /// <param name="id"> </param>
        /// <summary>
        ///     Delete Zone
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("delete/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Delete(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteZone(id);

            return Ok();
        }


        /// <param name="model"> </param>
        /// <summary>
        ///     Add Zone
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Add([FromBody] AddOrEditZoneModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddZone(model);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///     Edit Zone
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPost]
        [Route("edit/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Edit(string id, [FromBody] AddOrEditZoneModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.EditZone(id, model);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///     Get Zone Devices
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(ZoneDevicesModel))]
        [HttpGet]
        [Route("devices/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetZoneDevices(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetZoneDevices(id);

            return Ok(response);
        }


        /// <summary>
        ///     Get Zones
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(ZonesModel))]
        [HttpGet]
        [Route("list")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> List()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetZones();

            return Ok(response);
        }

    }

}