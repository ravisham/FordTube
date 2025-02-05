namespace FordTube.WebApi.Models
{
    /// <summary>
    /// Represents a request to refresh the JWT token.
    /// </summary>
    public class JwtTokenRefreshRequest
    {
        /// <summary>
        /// Gets or sets the current JWT token.
        /// </summary>
        public string Token { get; set; }
    }
}