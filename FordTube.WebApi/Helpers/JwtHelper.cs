using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using FordTube.WebApi.Models;

using Microsoft.IdentityModel.Tokens;

namespace FordTube.WebApi.Helpers
{
    /// <summary>
    /// Provides methods for generating and validating JWT tokens.
    /// </summary>
    public static class JwtHelper
    {
        /// <summary>
        /// Generates a JWT token.
        /// </summary>
        /// <param name="claims">The claims to include in the token.</param>
        /// <param name="jwtSettings">The JWT settings.</param>
        /// <returns>The generated JWT token.</returns>
        public static string GenerateJwtToken(IEnumerable<Claim> claims, JwtSettings jwtSettings)
        {
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
            var signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var jwtToken = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audiences.FirstOrDefault(),
                claims: claims,
                expires: DateTime.Now.AddMinutes(jwtSettings.DurationInMinutes),
                signingCredentials: signingCredentials);

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }

        /// <summary>
        /// Gets the token validation parameters.
        /// </summary>
        /// <param name="jwtSettings">The JWT settings.</param>
        /// <returns>The token validation parameters.</returns>
        public static TokenValidationParameters GetTokenValidationParameters(JwtSettings jwtSettings)
        {
            return new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudiences = jwtSettings.Audiences,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
            };
        }
    }
}
