// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited.


#region

using System;
using System.Net;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using OneMagnify.Data.Ford.FordTube.Repositories;

using Swashbuckle.AspNetCore.Annotations;

#endregion


namespace FordTube.WebApi.Controllers
{

  using System.Linq;


  [ApiController]
  [Route("api/[controller]")]
  [EnableCors("CORS_POLICY")]
  [Produces("application/json")]
  public class DisclaimerController : ControllerBase
  {

    private readonly IUserRepository _userRepository;


    public DisclaimerController(IUserRepository userRepository)
    {
      _userRepository = userRepository;
    }


    [HttpGet]
    [Route("ShowUpdateDisclaimer")]
    [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
    public async Task<bool> ShowUpdateDisclaimer(string userId)
    {
      if (userId == null) return false;

      var matchingUsers = await _userRepository.FindAllAsync(userEntry => userEntry.UserName == userId);

      var user = matchingUsers.First();

      if (!user.DisclaimerDateChecked.HasValue || user.DisclaimerDateChecked == DateTime.MinValue.Date) return true;

      return (DateTime.Now.Date - user.DisclaimerDateChecked.Value.Date).TotalDays >= 90;
    }


    [HttpPost]
    [AllowAnonymous]
    [Route("UpdateDisclaimerLastSeen")]
    [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
    public async Task<string> UpdateDisclaimerLastSeen(string userId)
    {
      try
      {

        var matchingUsers = await _userRepository.FindAllAsync(userEntry => userEntry.UserName == userId);

        var user = matchingUsers.First();

        if (user == null)
        {
          Response.StatusCode = StatusCodes.Status403Forbidden;

          return "Unable to find corresponding user.";
        }

        await _userRepository.UpdateDisclaimerDateAsync(user.UserName);

        Response.StatusCode = StatusCodes.Status200OK;
      }
      catch (Exception exception)
      {
        Response.StatusCode = StatusCodes.Status403Forbidden;

        return exception.Message;
      }

      return null;
    }

  }

}
