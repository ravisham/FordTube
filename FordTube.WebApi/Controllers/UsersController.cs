// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Net;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;

using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IVBrickApiRepository _vbrickApi;

        public UsersController(IVBrickApiRepository vbrickApi)
        {
            _vbrickApi = vbrickApi;
        }

        /// <param name="id"> </param>
        /// <summary>
        ///     Get User
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UserModel))]
        [HttpGet]
        [Route("get/{id}")]
        [ResponseCache(Duration = 5 * 60)]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Get(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetUser(id);

            return Ok(response);
        }

        /// <param name="userName"> </param>
        /// <summary>
        ///     Get User by Username
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UserModel))]
        [HttpGet]
        [Route("get-by-username")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetByUserName([FromQuery] string userName)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetUserByUserName(userName);

            return Ok(response);
        }
    }

}