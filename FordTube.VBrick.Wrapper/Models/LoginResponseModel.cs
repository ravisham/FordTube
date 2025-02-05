using System;

namespace FordTube.VBrick.Wrapper.Models
{
    public class LoginResponseModel
    {

        public string Token { get; set; }

        public string Issuer { get; set; }

        public DateTime Expiration { get; set; }

        public string Email { get; set; }

        public string Id { get; set; }

        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Language { get; set; }

        public UserModel User { get; set; }

    }
}