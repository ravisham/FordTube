using System.Text;

using Newtonsoft.Json;

using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;


namespace LincolnVideoGallery.Web.Middleware;

/// <summary>
///   Middleware to handle user provisioning and token generation.
/// </summary>
/// <summary>
///   Middleware to handle user provisioning and token generation.
/// </summary>
public class ProvisioningMiddleware {

  private readonly IConfiguration _configuration;


  private readonly IHttpClientFactory _httpClientFactory;


  private readonly ILogger<ProvisioningMiddleware> _logger;


  private readonly RequestDelegate _next;


  public ProvisioningMiddleware(RequestDelegate next, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<ProvisioningMiddleware> logger)
  {
    _next              = next;
    _httpClientFactory = httpClientFactory;
    _configuration     = configuration;
    _logger            = logger;
  }


  public async Task InvokeAsync(HttpContext context)
  {
    var authorizationHeader = context.Request.Headers["Authorization"].FirstOrDefault();
    var token               = authorizationHeader?.StartsWith("Bearer ") == true ? authorizationHeader["Bearer ".Length..].Trim() : null;

    if (!string.IsNullOrEmpty(token))
    {
      _logger.LogInformation("Token found in request header");

      var userIdClaim = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

      if (string.IsNullOrEmpty(userIdClaim))
      {
        _logger.LogWarning("User ID claim not found in token");
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;

        return;
      }

      var userInfo          = new { UserId = userIdClaim, Email = $"{userIdClaim}@ford.com", UserName = userIdClaim };
      var provisionEndpoint = _configuration["ApiSettings:ProvisionEndpoint"];
      var request           = new HttpRequestMessage(HttpMethod.Post, provisionEndpoint) { Content = new StringContent(JsonConvert.SerializeObject(userInfo), Encoding.UTF8, "application/json") };

      _logger.LogInformation("Provisioning user with UserId: {UserId}", userIdClaim);
      var client   = _httpClientFactory.CreateClient();
      var response = await client.SendAsync(request);

      if (!response.IsSuccessStatusCode)
      {
        _logger.LogWarning("User provisioning failed with status code: {StatusCode}", response.StatusCode);
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;

        return;
      }

      _logger.LogInformation("User provisioned successfully with UserId: {UserId}", userIdClaim);
    }

    await _next(context);
  }

}
