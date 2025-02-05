using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;

using OneMagnify.Common.Extensions;
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Entities.Enums;
using OneMagnify.Data.Ford.FordTube.Repositories;
using OneMagnify.Ford.EntityInfo.Data.Repositories.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [Produces("application/json")]
    public class StarsController : ControllerBase
    {

        private readonly IStarsRepository _starsRepository;

        private readonly IUserRepository _userRepository;

        private readonly IConfiguration _configuration;

        public StarsController(IStarsRepository starsRepository, IUserRepository userRepository, IConfiguration configuration)
        {
            _starsRepository = starsRepository;
            _userRepository = userRepository;
            _configuration = configuration;
        }


        [HttpGet]
        [Route("Get")]
        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        public async Task<string> Get(string userId)
        {
            if (userId == null) return null;

            var user = await _userRepository.FindAsync(u => u.UserName == userId);

            return user?.StarsId;
        }


        [HttpGet]
        [Route("FromFordInfo")]
        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        public async Task<string> FromFordInfo(string userId)
        {
            if (userId == null) return null;

            var starsId = await GetStarsIdFromFordInfo(userId);

            return starsId;
        }


        // POST: api/Stars
        [HttpPost]
        [AllowAnonymous]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        public async Task<string> Post(string userId, string value)
        {
            try
            {

                var user = await _userRepository.FindAsync(u => u.UserName == userId);

                if (user == null)
                {
                    Response.StatusCode = StatusCodes.Status403Forbidden;

                    return "There was an issue while saving your Stars ID, please try again in a few moments.";
                }

                if (user.UserType == UserTypeEnum.DEALER)
                {
                    if (!await ValidateStarsId(value))
                    {
                        Response.StatusCode = StatusCodes.Status403Forbidden;

                        return "This Stars ID entered is invalid, please make sure that it was typed in correctly.";
                    }
                }

                user.StarsId = value;


                var result = await _userRepository.UpdateAsync(user, user.Id);

                // Successfully Updated User with the supplied starsId
                if (!result.StarsId.IsNullOrEmpty() && result.StarsId == value)
                {
                    await _userRepository.UpdateStarsDateAsync(user.UserName);

                    Response.StatusCode = StatusCodes.Status200OK;

                    return value;
                }

            }
            catch (Exception exception)
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;

                return exception.Message;
            }

            return null;
        }


        [HttpGet]
        [Route("ShowUpdateStars")]
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        public async Task<bool> ShowUpdateStars(string userId)
        {
            if (userId == null) return false;

            var user = await _userRepository.FindAsync(u => u.UserName == userId);

            if (!user.StarsDateChecked.HasValue || user.StarsDateChecked == DateTime.MinValue.Date) return true;

            return (DateTime.Now.Date - user.StarsDateChecked.Value.Date).TotalDays >= 90;
        }


        private async Task<string> GetStarsIdFromFordInfo(string userId)
        {
            var user = await _userRepository.FindAsync(u => u.UserName == userId);

            if (user == null) return null;

            var stars = await _starsRepository.FindAsync(g => g.Pnacode == user.PnaCode);

            return stars?.StudentIdnumber;
        }


        private async Task<bool> ValidateStarsId(string starsId)
        {
            if (!_configuration.GetSection("ValidateStarsId").Get<bool>()) return true;

            var stars = await _starsRepository.FindAsync(s => s.StudentIdnumber == starsId);

            return !string.IsNullOrEmpty(stars.StudentIdnumber);

        }
    }
}
