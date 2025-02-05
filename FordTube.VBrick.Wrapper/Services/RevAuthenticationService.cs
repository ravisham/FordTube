using System;
using System.Threading.Tasks;

using Flurl.Http;

using FordTube.VBrick.Wrapper.Http.Extensions;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;


namespace FordTube.VBrick.Wrapper.Services {

    public class RevAuthenticationService : IRevAuthenticationService {

        private readonly VBrickSettings _vbrickSettings;


        public RevAuthenticationService(IOptions<VBrickSettings> vbrickSettings)
        {
            _vbrickSettings = vbrickSettings.Value;
            VbrickApiEndpoints = new RevApiUrls(_vbrickSettings.BaseUrl);
        }


        private RevApiUrls VbrickApiEndpoints { get; }


        public string AccessToken { get; set; }


        public DateTimeOffset? TokenExpires { get; set; }


        public async Task AuthenticateAsync()
        {
            var hasValidSessionWithRev = await CheckRemoteSession();

            if (!hasValidSessionWithRev)
            {
                // Get access token
                await GetAccessTokenAsync(_vbrickSettings.ApiKey, _vbrickSettings.Secret);
            }
            else
            {
                // Check access token expiration
                if (TokenExpires != null && DateTimeOffset.Now.AddMinutes(5) > TokenExpires)

                    // Get a new one
                    await ExtendSessionAsync();
            }
        }


        public async Task<bool> CheckRemoteSession()
        {
            if (AccessToken == null || string.IsNullOrEmpty(AccessToken)) return false;

            var response = await VbrickApiEndpoints.CheckSessionUrl.WithVbrickRevApiToken(AccessToken).GetAsync();

            return response.StatusCode == StatusCodes.Status200OK;
        }


        private async Task GetAccessTokenAsync(string apiKey, string secret)
        {
            var model = new ApiAuthenticateModel { ApiKey = apiKey, Secret = secret };

            var response = await VbrickApiEndpoints.ApiAuthenticate.PostJsonAsync(model).ReceiveJson<ApiAuthenticateResponseModel>();

            if (response == null || string.IsNullOrEmpty(response.Token)) throw new Exception("Empty Response From the REV Platform when attempting to authenticate with API Key and Secret.");

            SetProperties(response);
        }


        private async Task ExtendSessionAsync()
        {
            var response = await string.Format(VbrickApiEndpoints.ApiExtendSession, _vbrickSettings.ApiKey).WithVbrickRevApiToken(AccessToken).PostAsync().ReceiveJson<ApiExtendSessionResponseModel>();

            var temporaryCacheUpdateModel = new ApiAuthenticateResponseModel { Expiration = response.Expiration, Token = AccessToken };

            if (response == null || response.Expiration == DateTimeOffset.MinValue) throw new Exception("Empty Response From the REV Platform when attempting to Extend session.");

            SetProperties(temporaryCacheUpdateModel);
        }


        private void SetProperties(ApiAuthenticateResponseModel result)
        {
            AccessToken = result?.Token;
            TokenExpires = result?.Expiration;
        }

    }

}