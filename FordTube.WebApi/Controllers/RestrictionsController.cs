using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using OneMagnify.Data.Ford.FordTube.Repositories;
using OneMagnify.Ford.EntityInfo.Data.Repositories.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [Produces("application/json")]
    public class RestrictionsController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        private readonly IGoldDRepository _goldDRepository;

        private readonly IHubRepository _hubRepository;


        private readonly IVBrickApiRepository _vbrickApi;


        public RestrictionsController(IHubRepository hubRepository, IUserRepository userRepository, IGoldDRepository goldDRepository, IVBrickApiRepository vbrickApi)
        {
            
            _userRepository  = userRepository;
            _goldDRepository = goldDRepository;
            _hubRepository = hubRepository;
            _vbrickApi = vbrickApi;
        }


        [HttpGet]
        [Route("Market")]
        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        public async Task<string> Market(string userId)
        {
            if (userId == null) return null;

            var market = await GetMarketFromFordInfo(userId);

            return market;
        }

        [HttpPut]
        [Route("permissions")]
        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
        public async Task<bool> Permissions(CheckPermissionsModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var result = await _vbrickApi.CheckPermissions(model);

            return result;
        }


        private async Task<string> GetMarketFromFordInfo(string userId)
        {
            var user = await _userRepository.FindAsync(u => u.UserName.Equals(userId));

            if (user == null) return null;

            var dealer = await _goldDRepository.FindAsync(d => d.PnaCode.Equals(user.PnaCode));

            if (dealer?.FcsdMktArea == null || dealer.GeoSalesCode == null) return null;

            var market = await _hubRepository.FindByAsync(hub => hub.HubAbbreviation.Equals(dealer.FcsdMktArea) && dealer.GeoSalesCode.Equals("USA"));

            return market?.Distinct().First().HubName;
        }
    }
}
