using LincolnVideoGallery.Web.Middleware;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.SpaServices.AngularCli;

using OneMagnify.AdfsCore.Configuration;
using OneMagnify.AdfsCore.DependencyInjection;
using OneMagnify.Dsn;
using OneMagnify.NetCore.Logging.File;
using OneMagnify.P3PMiddleware.DependencyInjection;
using OneMagnify.WslNetCore.FordDealers.Configuration;
using OneMagnify.WslNetCore.FordDealers.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDataProtection().SetApplicationName("dealerconnection");

builder.Configuration.SetBasePath(builder.Environment.ContentRootPath).AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", false, true).AddEnvironmentVariables();

builder.Logging.AddFile();

builder.Services.AddHttpContextAccessor();
builder.Services.AddSession();

builder.Services.AddFordDealerMiddleware(new WslFordDealerOptions { CookieDomain = builder.Configuration.GetSection("WSL:CookieDomain").Value, FordDealerUrl = builder.Configuration["FordDealerUrl"], LincolnDealerUrl = builder.Configuration["LincolnDealerUrl"], FordInfoDbConnectionString = DsnConnectionString.FromDsn(builder.Configuration["FordInfoDbConnectionString"]) });

builder.Services.AddAdfsMiddleware(new AdfsOptions
{
  Domain = builder.Configuration["Auth0:Domain"],
  ClientId = builder.Configuration["Auth0:ClientId"],
  CookieNameMapping = builder.Configuration.GetSection("Auth0:CookieNameMapping").Get<Dictionary<string, string>>(),
  Resource = builder.Configuration["Auth0:Resource"],
  CreateCookies = Convert.ToBoolean(builder.Configuration["Auth0:CreateCookies"]),
  Claims = builder.Configuration.GetSection("Auth0:Claims").Get<List<string>>()
});

builder.Services.AddRazorPages(pagesOptions =>
{
  var policy = new AuthorizationPolicyBuilder().AddAuthenticationSchemes("oidc").RequireAuthenticatedUser().Build();
  pagesOptions.Conventions.ConfigureFilter(model => new AuthorizeFilter(policy));
});

builder.Services.AddMvc().AddRazorPagesOptions(options =>
{
  // Match all routes to the index so we can handle routing client-side.
  options.Conventions.AddPageRoute("/index", "{*url}");
});


builder.Services.AddHttpClient(); // Add HttpClientFactory to DI
builder.Services.AddTransient<ProvisioningMiddleware>();


builder.Services.AddAuthorization(options => { options.AddPolicy("ADFS", policy => policy.RequireClaim("uid")); });

builder.Services.AddAuthentication();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment() && !app.Environment.EnvironmentName.Equals("Debug"))
{
  app.UseExceptionHandler("/Error");
  app.UseHsts();
}


app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors(corsPolicyBuilder => corsPolicyBuilder.AllowAnyHeader().SetIsOriginAllowedToAllowWildcardSubdomains().AllowAnyMethod().AllowCredentials());
app.UseAuthorization();

var options = new RewriteOptions();
options.AddRedirect("^(.*)/embed.asp(.*)", "standalone/embed$2");
options.AddRewrite("^video.php(.*)", "watch$1", true);
options.AddRedirect("^index.php(.*)", "/");
app.UseRewriter(options);

// Configures the HTTP request pipeline for development or debug environment.
// Adds the developer exception page and configures the Angular CLI server for serving the Angular app from our .NET application over localhost.
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName.Contains("Debug"))
{
  app.UseDeveloperExceptionPage();
  app.UseSpa(spa =>
  {
    spa.Options.SourcePath = "src";

    spa.UseAngularCliServer("ng serve --disable-host-check --configuration=debug");

    spa.UseProxyToSpaDevelopmentServer("https://localhost:3000"); // Angular dev server URL
  });
}
else
{
    app.MapFallbackToFile("index.html");
}

app.UseAdfsMiddleware();
app.UseMiddleware<ProvisioningMiddleware>();
app.UseP3PMiddleware();
app.UseSession();

app.MapRazorPages();
app.UseFordDealerMiddleware();


app.Run();
