// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Net;
using System.Threading.Tasks;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

using Swashbuckle.AspNetCore.Annotations;


namespace FordTube.WebApi.Controllers
{
    [ApiController]
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    public class AccessEntitiesController : ControllerBase
    {
        private readonly IVBrickApiRepository _vbrickApi;


        public AccessEntitiesController( IVBrickApiRepository vbrickApi)
        {
            _vbrickApi = vbrickApi;
        }

        /// <summary>
        ///     Search Access Entities
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(AccessEntitiesModel))]
        [HttpGet]
        [Route("getall")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetAll()
        {
            await _vbrickApi.SetConfigVBrickApi();

            var result = await _vbrickApi.GetAccessEntities();

            if (result == null) throw new ArgumentNullException(nameof(result));

            return Ok(result);

        }


        /// <summary>
        ///     Search Access Entities
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(AccessEntitiesModel))]
        [HttpGet]
        [Route("search")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Search(string query, string type)
        {
            await _vbrickApi.SetConfigVBrickApi();
          

            var result = await _vbrickApi.QueryAccessEntities(query, type);

            if (result == null) throw new ArgumentNullException(nameof(result));

            return Ok(result);
        }

    }

}