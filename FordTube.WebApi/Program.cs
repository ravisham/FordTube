using Flurl.Http;

using FordTube.VBrick.Wrapper;
using FordTube.VBrick.Wrapper.Http.Client;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.VBrick.Wrapper.Services;
using FordTube.WebApi.Authentication;
using FordTube.WebApi.Data;
using FordTube.WebApi.Helpers;
using FordTube.WebApi.Middleware;
using FordTube.WebApi.Models;
using FordTube.WebApi.Services;

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using Microsoft.OpenApi.Models;

using MongoDB.Bson;
using MongoDB.Driver;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using OneMagnify.Calendar.EventGenerator.DependencyInjection;
using OneMagnify.Data.Ford.FordTube.DependencyInjection;
using OneMagnify.Dsn;
using OneMagnify.Dsn.MongoDb;
using OneMagnify.Ford.EntityInfo.DependencyInjection;
using OneMagnify.NetCore.Logging.File;
using OneMagnify.P3PMiddleware.DependencyInjection;
using OneMagnify.Xapi.DependencyInjection;

using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;


var builder = WebApplication.CreateBuilder(args);


builder.Configuration.SetBasePath(builder.Environment.ContentRootPath).AddJsonFile("appsettings.json", false, true).AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true, true).AddEnvironmentVariables();


builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

var jwtSettings = new JwtSettings();

builder.Configuration.GetSection("Jwt").Bind(jwtSettings);

builder.Services.AddSingleton(jwtSettings);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Ensure JWT settings are properly configured
if (string.IsNullOrEmpty(jwtSettings.Key) || string.IsNullOrEmpty(jwtSettings.Issuer) || jwtSettings.Audiences == null || !jwtSettings.Audiences.Any()) throw new ArgumentException("JWT settings are not properly configured in appsettings.json");

builder.Services.AddAuthentication(options =>
       {
           options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
           options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
       })
       .AddJwtBearer(options =>
       {
           options.RequireHttpsMetadata = false;
           options.SaveToken = true;
           options.TokenValidationParameters = JwtHelper.GetTokenValidationParameters(jwtSettings);
       })
       .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
                  options =>
                  {
                      options.Cookie.Name = "ftsc";
                      options.Cookie.HttpOnly = true;
                      options.ExpireTimeSpan = TimeSpan.FromDays(1);
                      options.SlidingExpiration = true;
                  });

builder.Services.AddAuthorization(options => { options.AddPolicy("Authenticated", policy => { policy.RequireAuthenticatedUser(); }); });


builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CORS_POLICY",
                  policy =>
                  {
                      policy.AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials()
                            .WithOrigins("https://localhost:5001",
                                         "http://localhost:5000",
                                         "https://fordtubeqa.dealerconnection.com",
                                         "https://fordtube.dealerconnection.com",
                                         "https://lincolnvideogallery.dealerconnection.com",
                                         "https://lincolnvideogalleryqa.dealerconnection.com");
                  });
});

builder.Services.AddMemoryCache();

builder.Logging.AddFile();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<UserService>();

builder.Services.Configure<VBrickSettings>(options => builder.Configuration.GetSection("VBrickSettings").Bind(options));

builder.Services.AddSingleton(provider => provider.GetService<IOptions<VBrickSettings>>()?.Value);

builder.Services.Configure<FormOptions>(x => { x.MultipartBodyLengthLimit = long.MaxValue; });

builder.Services.AddFordTubeDbContext(options => options.ConnectionString = DsnConnectionString.FromDsn(builder.Configuration["FileDsn"]) + ";Max Pool Size=300;");

builder.Services.AddFordInfoDbContext(options => options.FordInfoDbConnectionString = DsnConnectionString.FromDsn(builder.Configuration["FordInfoDbConnectionString"]) + ";Max Pool Size=300;");

// Register MongoDB conventions
MongoConventions.RegisterConventions();

// Add MongoDB client as a singleton service
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var configuration    = sp.GetRequiredService<IConfiguration>();
    var mongoConnectionString = configuration.GetRequiredSection("MongoDsn");
    return new MongoClient(MongoDbDsnConnectionString.FromDsn(mongoConnectionString.Value ?? throw new InvalidOperationException("Mongo DB DSN configuration is invalid.")));
});

builder.Services.AddScoped<BasicAuthenticationFilterAttribute>();

builder.Services.AddSingleton<IRevAuthenticationService, RevAuthenticationService>();

builder.Services.AddTransient<IRevApiClient, RevApiClient>();

builder.Services.AddTransient<IVBrickApiRepository, VBrickApiRepository>();

builder.Services.AddHostedService<RevAuthenticationHostedTimerService>();

builder.Services.AddCalendarFileGenerators();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FordTube Web API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
    c.MapType<BsonDocument>(() => new OpenApiSchema { Type = "object" });
});

builder.Services.AddControllers(options => { options.Filters.Add(new AuthorizeFilter("Authenticated")); })
       .AddNewtonsoftJson(options =>
       {
           // Serialize enums as strings in API responses (e.g., Role)
           options.SerializerSettings.Converters.Add(new StringEnumConverter());

           // Ignore omitted parameters on models to enable optional params (e.g., User update)
           options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;

           // Handle reference loops
           options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
       });


builder.Services.AddXapiClient(builder.Configuration);

builder.Services.AddSingleton<EncryptionHelper>();




var app = builder.Build();

app.UseCors("CORS_POLICY");

app.UseAuthentication();

app.UseAuthorization();

// Configure the HTTP request pipeline.
if (!app.Environment.EnvironmentName.Equals("Debug")) app.UseHttpsRedirection();

app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FordTube Web API v1");
    c.DefaultModelsExpandDepth(-1); // Disable schema descriptions
    c.DocumentTitle = "FordTube API Documentation";
});

app.UseStaticFiles();

ServiceActivator.Configure(app.Services);

FlurlHttp.ConfigureClient(app.Configuration.GetSection("VbrickSettings:BaseUrl").Value,
                          client =>
                          {
                              client.Settings.Redirects.ForwardAuthorizationHeader = true;
                              client.WithHeader(HeaderNames.Accept, "*/*");
                              client.WithHeader(HeaderNames.UserAgent, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36");
                          });

app.Use((context, next) =>
{
    if (!context.Response.Headers.ContainsKey("Vary")) context.Response.Headers["Vary"] = "Origin";

    return next.Invoke();
});

app.UseP3PMiddleware();

app.UseOptions();

app.UseFileServer(new FileServerOptions { FileProvider = new PhysicalFileProvider(app.Configuration.GetSection("UploadPath").Value ?? throw new InvalidOperationException("UploadPath not configured")), RequestPath = new PathString("/uploads") });

app.UseFileServer(new FileServerOptions { FileProvider = new PhysicalFileProvider(app.Configuration.GetSection("DownloadPath").Value ?? throw new InvalidOperationException("DownloadPath not configured")), RequestPath = new PathString("/downloads") });

app.MapControllers();

app.Run();