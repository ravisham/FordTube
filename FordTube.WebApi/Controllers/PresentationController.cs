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
    public class PresentationController : ControllerBase
    {


        private readonly IVbrickMappingRepository _mappingRepository;


        private readonly IVBrickApiRepository _vbrickApi;


        public PresentationController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            
            _mappingRepository = mappingRepository;
            
            _vbrickApi = vbrickApi;
        }

        /// <summary>
        ///     Get Presentation Profiles
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(PresentationProfileModel))]
        [HttpGet]
        [Route("get-profiles")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetProfiles()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetPresentationProfiles();

            return Ok(response);
        }

    }

}