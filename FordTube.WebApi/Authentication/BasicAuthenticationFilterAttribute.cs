// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Security.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FordTube.WebApi.Authentication
{

    public class BasicAuthenticationFilterAttribute : ActionFilterAttribute
    {

        private const string FRANCHISE_HEADER_NAME = "franchise";


        public override void OnActionExecuting(ActionExecutingContext context)
        {
            ValidateAuthenticationHeaders(context?.HttpContext?.Request);
            base.OnActionExecuting(context);
        }


        private static void ValidateAuthenticationHeaders(HttpRequest request)
        {
            var franchise = GetRequestFranchiseHeaderValue(request);
            if (string.IsNullOrEmpty(franchise))
                throw new AuthenticationException("You must send franchise header.");
        }

        private static string GetRequestFranchiseHeaderValue(HttpRequest request)
        {
            return request.Headers.Keys.Contains(FRANCHISE_HEADER_NAME) ? request.Headers[FRANCHISE_HEADER_NAME][0] : null;
        }

    }

}