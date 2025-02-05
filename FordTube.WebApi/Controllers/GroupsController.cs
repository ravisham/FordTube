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
    public class GroupsController : ControllerBase
    {


        private readonly IVbrickMappingRepository _mappingRepository;


        private readonly IVBrickApiRepository _vbrickApi;

        public GroupsController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi)
        {
            _mappingRepository = mappingRepository;
            
            _vbrickApi = vbrickApi;
        }

        /// <param name="model"> </param>
        /// <summary>
        ///     Add Group
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> AddGroup([FromBody] AddOrEditGroupModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddGroup(model);

            return Ok(response);
        }


        /// <param name="groupId"> </param>
        /// <summary>
        ///     Delete Group
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("delete")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> DeleteGroup([FromBody] string groupId)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteGroup(groupId);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <param name="model"> </param>
        /// <summary>
        ///     Edit Group
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpPut]
        [Route("edit/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> EditGroup(string id, [FromBody] AddOrEditGroupModel model)
        {
            
            await _vbrickApi.EditGroup(id, model);

            return Ok();
        }


        /// <param name="id"> </param>
        /// <summary>
        ///     Search by Group
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(GroupModel))]
        [HttpPut]
        [Route("search/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> SearchGroup(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.SearchGroup(id);

            return Ok(response);
        }

        /// <summary>
        ///     Market Group items
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UserGroupModel[]))]
        [HttpGet]
        [Route("market-groups")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> MarketGroups()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetMarketCategories();

            return Ok(response);
        }

        /// <summary>
        ///     Roles Group items
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(UserGroupModel[]))]
        [HttpGet]
        [Route("role-groups")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> RoleGroups()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetRoleCategories();

            return Ok(response);
        }

    }

}