using System.Security.Claims;
using System.Text.Json;

using FordTube.WebApi.Helpers;
using FordTube.WebApi.Models;
using FordTube.WebApi.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FordTube.WebApi.Controllers
{
    /// <summary>
    /// Handles authentication-related actions.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthenticationController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<AuthenticationController> _logger;
        private readonly JwtSettings _jwtSettings;
        private readonly EncryptionHelper _encryptionHelper;
        private readonly IConfiguration _configuration;


        public AuthenticationController(UserService userService, ILogger<AuthenticationController> logger, JwtSettings jwtSettings, EncryptionHelper encryptionHelper, IConfiguration configuration)
        {
            _userService = userService;
            _logger = logger;
            _jwtSettings = jwtSettings;
            _encryptionHelper = encryptionHelper;
            _configuration = configuration;
        }

        /// <summary>
        /// Exchanges the access token for a user session by extracting claims from the token.
        /// </summary>
        /// <param name="request">TokenExchangeRequest containing the access token.</param>
        /// <returns>ActionResult</returns>
        [AllowAnonymous]
        [HttpPost("exchange-token")]
        public async Task<IActionResult> ExchangeToken([FromBody] TokenExchangeRequest request)
        {
            if (string.IsNullOrEmpty(request.AccessToken))
            {
                _logger.LogWarning("Access token is missing.");
                return BadRequest("Access token is missing.");
            }

            ClaimsPrincipal principal;
            try
            {
                principal = _userService.DecodeAccessTokenWithoutValidation(request.AccessToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to decode access token: {Message}", ex.Message);
                return BadRequest("Invalid access token.");
            }

            var claims = principal.Claims.ToList();
            
            var user = await _userService.GetOrCreateUserAsync(claims);

            var identityClaims = new List<Claim>
            {
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Email, user.EmailAddress),
                new(ClaimTypes.GivenName, user.FirstName),
                new(ClaimTypes.Surname, user.LastName),
                new("PnaCode", user.PnaCode),
                new("StarsId", user?.StarsId ?? string.Empty),
                new("UserTypeId", user.UserTypeId.ToString()),
                new("UserRoleId", user.UserRoleId.ToString()),
                new("Franchise", user.Franchise.ToString())
            };

            await _userService.SignInUserAsync(identityClaims);

            var jwtToken = JwtHelper.GenerateJwtToken(identityClaims, _jwtSettings);

            var aesKey    = _configuration["Encryption:AesKey"];

            return Ok(new { token = jwtToken, franchise = user.Franchise, aesKey });
        }

        /// <summary>
        /// Retrieves the current user's claims.
        /// </summary>
        /// <returns>ActionResult</returns>
        [Authorize]
        [HttpGet("userinfo")]
        public async Task<IActionResult> GetUserInfo()
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var emailAddress = User.FindFirst(ClaimTypes.Email)?.Value;
            var firstName = User.FindFirst(ClaimTypes.GivenName)?.Value;
            var lastName = User.FindFirst(ClaimTypes.Surname)?.Value;
            var pnaCode = User.FindFirst("PnaCode")?.Value;

            if (userName == null || emailAddress == null || firstName == null || lastName == null || pnaCode == null)
            {
                _logger.LogWarning("Required claims are missing. User: {UserName}, Email: {EmailAddress}, FirstName: {FirstName}, LastName: {LastName}, PnaCode: {PnaCode}", userName, emailAddress, firstName, lastName, pnaCode);
                return BadRequest("Required claims are missing.");
            }

            var user = await _userService.GetUserByClaimsAsync(userName, emailAddress, firstName, lastName, pnaCode);

            if (user != null)
            {
                var jwtUser = new JwtUser
                {
                    UserName = user.UserName,
                    EmailAddress = user.EmailAddress,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    StarsId = user.StarsId,
                    PnaCode = user.PnaCode,
                    UserTypeId = user.UserTypeId,
                    UserRoleId = user.UserRoleId,
                    Franchise = user.Franchise
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var jwtUserJson = JsonSerializer.Serialize(jwtUser, options);
                var encryptedJwtUser = _encryptionHelper.Encrypt(jwtUserJson);

                return Ok(new { data = encryptedJwtUser });
            }

            _logger.LogWarning("User not found. User: {UserName}, Email: {EmailAddress}, FirstName: {FirstName}, LastName: {LastName}, PnaCode: {PnaCode}", userName, emailAddress, firstName, lastName, pnaCode);
            return NotFound("User not found.");
        }

        /// <summary>
        /// Refreshes the JWT token.
        /// </summary>
        /// <param name="request">TokenRefreshRequest containing the current JWT token.</param>
        /// <returns>ActionResult</returns>
        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] JwtTokenRefreshRequest request)
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                _logger.LogWarning("Refresh token is missing.");
                return BadRequest("Refresh token is missing.");
            }

            ClaimsPrincipal principal;
            try
            {
                principal = _userService.DecodeAccessTokenWithoutValidation(request.Token);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to decode refresh token: {Message}", ex.Message);
                
                return BadRequest("Invalid refresh token.");
            }

            var claims = principal.Claims.ToList();
            
            var user = await _userService.GetOrCreateUserAsync(claims);

            await _userService.SignInUserAsync(claims);

            var jwtToken = JwtHelper.GenerateJwtToken(claims, _jwtSettings);

            var aesKey = _configuration["Encryption:AesKey"];

            return Ok(new { token = jwtToken, franchise = user.Franchise, aesKey });
        }
    }
}
