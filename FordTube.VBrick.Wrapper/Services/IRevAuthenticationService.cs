using System;
using System.Threading.Tasks;


namespace FordTube.VBrick.Wrapper.Services {

    public interface IRevAuthenticationService {

        string AccessToken { get; set; }


        DateTimeOffset? TokenExpires { get; set; }


        Task AuthenticateAsync();


        Task<bool> CheckRemoteSession();

    }

}