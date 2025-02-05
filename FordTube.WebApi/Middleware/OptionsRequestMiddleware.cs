using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace FordTube.WebApi.Middleware
{
    
    /// <summary></summary>
    public class OptionsRequestMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<OptionsRequestMiddleware> _logger;


        /// <summary>
        /// Initializes a new instance of the <see cref="OptionsRequestMiddleware"/> class.
        /// </summary>
        /// <param name="next">The next.</param>
        /// <param name="logger">The logger.</param>
        public OptionsRequestMiddleware(RequestDelegate next, ILogger<OptionsRequestMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }


        /// <summary>
        /// Invokes the specified context.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns><see cref="Task" /></returns>
        public Task Invoke(HttpContext context)
        {
            return BeginInvoke(context);
        }


        /// <summary>
        /// Begins the invoke.
        /// </summary>
        /// <param name="context"><see cref="HttpContext" /></param>
        /// <returns><see cref="Task" /></returns>


        private Task BeginInvoke(HttpContext context)
        {
            if (context.Request.Path.ToString().Contains("/api/v2"))
            {
                _logger.LogInformation("VBrick HTTP request information: Method:" + context.Request.Method + " Path: " + context.Request.Path + " HTTP response information: StatusCode:" + context.Response.StatusCode);
            }

            if (context.Request.Method != "OPTIONS") return _next.Invoke(context);

            context.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });
            context.Response.Headers.Add("Access-Control-Allow-Headers", new[] { "*" });
            context.Response.Headers.Add("Access-Control-Allow-Methods", new[] { "GET, POST, PUT, DELETE, OPTIONS" });
            context.Response.Headers.Add("Access-Control-Allow-Credentials", new[] { "true" });
            context.Response.StatusCode = 200;
            return context.Response.WriteAsync("OK");

        }
    }

    
    /// <summary></summary>
    public static class OptionsMiddlewareExtensions
    {
        
        /// <summary></summary>
        /// <param name="builder"><see cref="IApplicationBuilder"/></param>
        /// <returns><see cref="IApplicationBuilder"/></returns>
        public static IApplicationBuilder UseOptions(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<OptionsRequestMiddleware>();
        }
    }
}
