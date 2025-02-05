using System;
using Flurl;
using Flurl.Http;

using FordTube.VBrick.Wrapper.Services;

using Microsoft.Extensions.DependencyInjection;


namespace FordTube.VBrick.Wrapper.Http.Extensions
{
    public static class FlurlExtensions
    {
        public static IFlurlRequest WithAuthentication(this Url url)
        {
            return new FlurlRequest(url).WithAuthentication();
        }

        public static IFlurlRequest WithAuthentication(this Uri uri)
        {
            return new FlurlRequest(uri).WithAuthentication();
        }

        public static IFlurlRequest WithAuthentication(this string url)
        {
            return new FlurlRequest(url).WithAuthentication();
        }

        public static IFlurlRequest WithAuthentication(this IFlurlRequest flurlRequest)
        {
            using var serviceScope = ServiceActivator.GetScope();

            var authService = serviceScope.ServiceProvider.GetService<IRevAuthenticationService>();

            authService.AuthenticateAsync().Wait();

            return flurlRequest;
        }


        public static IFlurlRequest WithVbrickRevApiToken(this Url url, string token)
        {
            return new FlurlRequest(url).WithVbrickRevApiToken(token);
        }

        public static IFlurlRequest WithVbrickRevApiToken(this Uri url, string token)
        {
            return new FlurlRequest(url).WithVbrickRevApiToken(token);
        }
        public static IFlurlRequest WithVbrickRevApiToken(this string url, string token)
        {
            return new FlurlRequest(url).WithVbrickRevApiToken(token);
        }

        public static IFlurlRequest WithVbrickRevApiToken(this IFlurlRequest flurlRequest, string token)
        {
            return new FlurlRequest(flurlRequest.Url).WithVbrickRevApiToken(token);
        }


        private static T WithVbrickRevApiToken<T>(this T clientOrRequest, string token) where T : IHttpSettingsContainer
        {
            return clientOrRequest.WithHeader("Authorization", $"Vbrick {token}");
        }
    }
}
