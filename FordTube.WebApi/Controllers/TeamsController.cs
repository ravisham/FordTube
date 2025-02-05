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
    public class TeamsController : ControllerBase
    {


        private readonly IVbrickMappingRepository _mappingRepository;


        private readonly IVBrickApiRepository _vbrickApi;


        public TeamsController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            
            _mappingRepository = mappingRepository;
            
            _vbrickApi = vbrickApi;
        }

        /// <param name="id"> </param>
        /// <summary>
        ///     Delete Team
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("delete/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Delete(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteTeam(id);

            return Ok();
        }


        /// <param name="model"> </param>
        /// <summary>
        ///     Add Team
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Add([FromBody] AddTeamModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddTeam(model);

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///     Edit Team
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("edit/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Edit(string id, [FromBody] AddTeamModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.EditTeam(id, model);

            return Ok();
        }


        /// <summary>
        ///     Get Teams
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(TeamModel[]))]
        [HttpGet]
        [Route("list")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> List()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetTeams();

            return Ok(response);
        }


        /// <summary>
        ///     Search Teams
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(SearchTeamModel[]))]
        [HttpGet]
        [Route("search")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Search()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.SearchTeam();

            return Ok(response);
        }

    }

}