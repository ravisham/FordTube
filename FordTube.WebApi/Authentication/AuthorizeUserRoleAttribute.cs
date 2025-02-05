using FordTube.WebApi.Services;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OneMagnify.Data.Ford.FordTube.Entities.Enums;

namespace FordTube.WebApi.Authentication
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
    public class AuthorizeUserRoleAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly UserRoleEnum[] _requiredRoles;

        public AuthorizeUserRoleAttribute(params UserRoleEnum[] requiredRoles)
        {
            _requiredRoles = requiredRoles;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var userService = (UserService)context.HttpContext.RequestServices.GetService(typeof(UserService));

            if (userService == null)
            {
                context.Result = new ForbidResult();
                return;
            }

            var user = context.HttpContext.User;

            if (user.Identity is not { IsAuthenticated: true })
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userRoleIdClaim = user.Claims.FirstOrDefault(c => c.Type == "UserRoleId")?.Value;
            var userName = user.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name)?.Value;
            var surname = user.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Surname)?.Value;
            var givenName = user.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.GivenName)?.Value;
            var fordSiteCode = user.Claims.FirstOrDefault(c => c.Type == "PnaCode")?.Value;

            if (userRoleIdClaim == null || !int.TryParse(userRoleIdClaim, out var userRoleId) || string.IsNullOrEmpty(userName))
            {
                context.Result = new ForbidResult();
                return;
            }

            var userFromDb = await userService.GetUserByClaimsAsync(userName, userName + "@ford.com", givenName, surname, fordSiteCode);

            if (userFromDb == null || userFromDb.UserRoleId != userRoleId)
            {
                context.Result = new ForbidResult();
                return;
            }

            if (!_requiredRoles.Contains((UserRoleEnum)userRoleId))
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
