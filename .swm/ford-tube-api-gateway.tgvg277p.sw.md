---
title: Ford Tube API Gateway
---
# Introduction

This document will walk you through the implementation of the Ford Tube API Gateway. The purpose of this gateway is to manage and route API requests to the <SwmLink doc-title="VBrick API Gateway ">[VBrick API Gateway ](/.swm/vbrick-api-gateway.jttcfbst.sw.md)</SwmLink> efficiently while ensuring security and scalability.

We will cover:

1. Configuration of application settings and environment.
2. Authentication and authorization setup.
3. Service registration and dependency injection.
4. Middleware configuration and request handling.
5. API documentation and Swagger integration.

# Configuration of application settings and environment

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="39">

---

The application begins by setting up the configuration using JSON files and environment variables. This allows for flexible configuration management across different environments.

```
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;


var builder = WebApplication.CreateBuilder(args);


builder.Configuration.SetBasePath(builder.Environment.ContentRootPath).AddJsonFile("appsettings.json", false, true).AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true, true).AddEnvironmentVariables();
```

---

</SwmSnippet>

# Authentication and authorization setup

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="56">

---

JWT settings are configured to ensure secure authentication. The application checks for proper JWT configuration and sets up authentication schemes for JWT and cookies.

```
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
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="81">

---

Authorization policies are defined to require authenticated users, and CORS policies are set to allow specific origins, methods, and headers.

```
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
```

---

</SwmSnippet>

# Service registration and dependency injection

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="117">

---

Various services are registered to the dependency injection container. This includes singleton services for configuration and <SwmToken path="/FordTube.WebApi/Program.cs" pos="119:4:4" line-data="// Register MongoDB conventions">`MongoDB`</SwmToken> client, scoped services for user management, and transient services for API clients.

```
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
```

---

</SwmSnippet>

# Middleware configuration and request handling

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="196">

---

The middleware pipeline is configured to handle CORS, authentication, and authorization. HTTPS redirection is conditionally applied based on the environment.

```
app.UseCors("CORS_POLICY");

app.UseAuthentication();

app.UseAuthorization();

// Configure the HTTP request pipeline.
if (!app.Environment.EnvironmentName.Equals("Debug")) app.UseHttpsRedirection();
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="214">

---

Static files are served, and <SwmToken path="/FordTube.WebApi/Program.cs" pos="218:0:0" line-data="FlurlHttp.ConfigureClient(app.Configuration.GetSection(&quot;VbrickSettings:BaseUrl&quot;).Value,">`FlurlHttp`</SwmToken> is configured for HTTP client settings, ensuring proper request handling and header management.

```
app.UseStaticFiles();

ServiceActivator.Configure(app.Services);

FlurlHttp.ConfigureClient(app.Configuration.GetSection("VbrickSettings:BaseUrl").Value,
                          client =>
                          {
                              client.Settings.Redirects.ForwardAuthorizationHeader = true;
                              client.WithHeader(HeaderNames.Accept, "*/*");
                              client.WithHeader(HeaderNames.UserAgent, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36");
                          });
```

---

</SwmSnippet>

# API documentation and Swagger integration

<SwmSnippet path="/FordTube.WebApi/Program.cs" line="205">

---

Swagger is integrated to provide API documentation. The Swagger UI is configured to display the API documentation, with security definitions for JWT authentication.

```
app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FordTube Web API v1");
    c.DefaultModelsExpandDepth(-1); // Disable schema descriptions
    c.DocumentTitle = "FordTube API Documentation";
});
```

---

</SwmSnippet>

# Conclusion

The Ford Tube API Gateway is designed to efficiently manage API requests with a focus on security and scalability. The configuration, authentication, service registration, middleware, and documentation are all set up to support these goals.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBRm9yZFR1YmUlM0ElM0FyYXZpc2hhbQ==" repo-name="FordTube"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
