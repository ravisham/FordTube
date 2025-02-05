// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited


using System.Net;
using System.Text;

using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;

using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

using OneMagnify.Calendar.EventGenerator.Providers;

using Swashbuckle.AspNetCore.Annotations;

using CalendarEventModel = OneMagnify.Calendar.EventGenerator.Models.CalendarEventModel;


namespace FordTube.WebApi.Controllers;

[Produces("application/json")]
[Route("api/[controller]")]
[EnableCors("CORS_POLICY")]
[ApiController]
public class EventsController : ControllerBase {

    private readonly ICalendarProvider _calendarProvider;


    private readonly IConfiguration _configuration;


    private readonly ILogger<EventsController> _logger;


    private readonly IMemoryCache _memoryCache;


    private readonly IVBrickApiRepository _vbrickApi;


    public EventsController(ICalendarProvider calendarProvider, IVBrickApiRepository vbrickApi, ILogger<EventsController> logger, IMemoryCache memoryCache, IConfiguration configuration)
    {
        _calendarProvider = calendarProvider;
        _vbrickApi = vbrickApi;
        _logger = logger;
        _memoryCache = memoryCache;
        _configuration = configuration;
    }


    /// <summary>
    ///     List of scheduled events
    /// </summary>
    /// <returns>A list of scheduled events.</returns>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(EventModel[]))]
    [SwaggerResponse((int) HttpStatusCode.BadRequest, Description = "Invalid franchise value or request parameters.")]
    [SwaggerResponse((int) HttpStatusCode.InternalServerError, Description = "An error occurred while processing the request.")]
    [HttpGet]
    [Route("list")]
    [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
    public async Task<IActionResult> List()
    {
        var franchise = Request.Headers["franchise"].ToString();

        // Validate the franchise value
        if (!IsValidFranchise(franchise))
        {
            _logger.LogWarning("Invalid franchise value received: {Franchise}", franchise);

            return BadRequest("Invalid franchise value. Allowed values are: Ford, Lincoln, Both.");
        }

        var cacheKey = GetCacheKey(franchise);

        if (!_memoryCache.TryGetValue(cacheKey, out EventModel[] cachedEvents))
        {
            _logger.LogInformation("Cache miss for franchise: {Franchise}", franchise);

            if (!await ConfigureVBrickApi()) { return StatusCode((int) HttpStatusCode.InternalServerError, "Error configuring VBrick API."); }

            var allEvents = await RetrieveAllEvents(franchise);

            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, "Error retrieving events from VBrick API."); }

            if (allEvents.Count > 0)
            {
                CacheEvents(cacheKey, allEvents.ToArray(), franchise);
                cachedEvents = allEvents.ToArray();
            }
            else
            {
                _logger.LogInformation("No events to cache for franchise: {Franchise}", franchise);

                return Ok(Array.Empty<EventModel>());
            }
        }
        else { _logger.LogInformation("Serving from cache for franchise: {Franchise}. Cached events count: {Count}", franchise, cachedEvents.Length); }

        return Ok(cachedEvents);
    }


    /// <param name="model"> </param>
    /// <summary>
    ///     Create event
    /// </summary>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
    [HttpPost]
    [Route("add")]
    [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
    public async Task<IActionResult> Add([FromBody] CreateEventModel model)
    {
        await _vbrickApi.SetConfigVBrickApi();
        await _vbrickApi.CreateEvent(model);

        return Ok();
    }


    /// <summary>
    ///     Downloads the specified calendar event as a '.ics' file.
    /// </summary>
    /// <param name="model">The calendar model.</param>
    /// <returns></returns>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(FileContentResult))]
    [HttpPost]
    [Route("download")]
    public ActionResult Download([FromBody] CalendarEventModel model)
    {
        if (model == null) return BadRequest("Must supply necessary calendar event parameters.");

        var fileContent = _calendarProvider.GenerateCalendarEventFileContents(model);
        fileContent = fileContent.Replace("\\n", "<br/>");

        var calendarBytes = Encoding.UTF8.GetBytes(fileContent);

        return File(calendarBytes, "text/calendar", "Event.ics");
    }


    /// <param name="id"> </param>
    /// <param name="model"> </param>
    /// <summary>
    ///     Edit event
    /// </summary>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
    [HttpPut]
    [Route("edit/{id}")]
    [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
    public async Task<IActionResult> Edit(string id, [FromBody] EditEventModel model)
    {
        await _vbrickApi.SetConfigVBrickApi();
        await _vbrickApi.EditEvent(id, model);

        return Ok();
    }


    /// <param name="id"> </param>
    /// <param name="model"> </param>
    /// <summary>
    ///     Edit event access
    /// </summary>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
    [HttpPut]
    [Route("edit-access/{id}")]
    [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
    public async Task<IActionResult> EditAccess(string id, [FromBody] EditEventAccessControlModel model)
    {
        await _vbrickApi.SetConfigVBrickApi();
        await _vbrickApi.EditEventAccess(id, model);

        return Ok();
    }


    /// <param name="id"> </param>
    /// <summary>
    ///     Get event
    /// </summary>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(EventDetailsModel))]
    [HttpGet]
    [Route("get/{id}")]
    [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
    public async Task<IActionResult> Get(string id)
    {
        await _vbrickApi.SetConfigVBrickApi();
        var response = await _vbrickApi.GetEvent(id);

        return Ok(response);
    }


    /// <param name="id"> </param>
    /// <summary>
    ///     Get event report
    /// </summary>
    [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(EventReportModel))]
    [HttpGet]
    [Route("report/{id}")]
    [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
    public async Task<IActionResult> Report(string id)
    {
        await _vbrickApi.SetConfigVBrickApi();
        var response = await _vbrickApi.GetEventReport(id);

        return Ok(response);
    }


    /// <summary>
    /// Validates if the given franchise is valid.
    /// </summary>
    /// <param name="franchise">The franchise to validate.</param>
    /// <returns>True if the franchise is valid, false otherwise.</returns>
    private static bool IsValidFranchise(string franchise)
    {
        var validFranchises = new[] { "Ford", "Lincoln", "Both" };

        return validFranchises.Contains(franchise);
    }


    /// <summary>
    /// Generates the cache key based on the franchise.
    /// </summary>
    /// <param name="franchise">The franchise name.</param>
    /// <returns>A cache key string.</returns>
    private static string GetCacheKey(string franchise) { return $"scheduled-events-{franchise.ToLower()}"; }


    /// <summary>
    /// Configures the VBrick API.
    /// </summary>
    /// <returns>True if the configuration is successful, false otherwise.</returns>
    private async Task<bool> ConfigureVBrickApi()
    {
        try
        {
            await _vbrickApi.SetConfigVBrickApi();
            _logger.LogInformation("VBrick API configured successfully.");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error configuring VBrick API.");

            return false;
        }
    }


    /// <summary>
    /// Retrieves all events for the given franchise.
    /// </summary>
    /// <param name="franchise">The franchise to retrieve events for.</param>
    /// <returns>A list of event models.</returns>
    private async Task<List<EventModel>> RetrieveAllEvents(string franchise)
    {
        var startDate = DateTime.UtcNow.Date;              // Today
        var endDate   = DateTime.UtcNow.Date.AddMonths(6); // 6 Months from now
        var allEvents = new List<EventModel>();

        // Fetch specific franchise events
        var specificEvents = await GetEventsForFranchise(franchise, startDate, endDate);

        if (specificEvents == null)
        {
            return null;
        }

        allEvents.AddRange(specificEvents);

        // Fetch events for "Both" if franchise is not "Both"
        if (franchise != "Both")
        {
            var bothEvents = await GetEventsForFranchise("Both", startDate, endDate);

            if (bothEvents == null)
            {
                return null;
            }

            allEvents.AddRange(bothEvents);
        }

        // Sort the combined list of events by StartDate
        var sortedEvents = allEvents.OrderBy(e => e.StartDate).ToList();

        return sortedEvents;
    }


    /// <summary>
    /// Gets events for a specific franchise within a given search window.
    /// </summary>
    /// <param name="franchise">The franchise to get events for.</param>
    /// <param name="startDate"></param>
    /// <param name="endDate"></param>
    /// <returns>A list of event models.</returns>
    private async Task<List<EventModel>> GetEventsForFranchise(string franchise, DateTime startDate, DateTime endDate)
    {
        var model = new EventsQueryModel
        {
            StartDate = startDate,
            EndDate = endDate,
            SortField = "startDate",
            SortDirection = "asc",
            Size = 50, // 50 Is minimum value in the Rev API
            CustomFields = new List<CustomFieldModel> { new() { Id = _configuration.GetSection("VBrickSettings:FranchiseCustomFieldId").Value, Name = "Franchise", Value = franchise } }
        };

        try
        {
            var response = await _vbrickApi.GetEvents(model);

            return response?.Events ?? new List<EventModel>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving events from VBrick API for franchise: {Franchise}", franchise);

            return null;
        }
    }


    /// <summary>
    /// Caches the events with a specified cache key.
    /// </summary>
    /// <param name="cacheKey">The cache key.</param>
    /// <param name="events">The events to cache.</param>
    /// <param name="franchise">The franchise the events belong to.</param>
    private void CacheEvents(string cacheKey, EventModel[] events, string franchise)
    {
        _logger.LogInformation("Caching {Count} events for franchise: {Franchise}", events.Length, franchise);

        var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(15))   // Cache expires after 1 hour of inactivity
                                                             .SetAbsoluteExpiration(TimeSpan.FromMinutes(30)) // Cache expires absolutely after 3 hours
                                                             .SetPriority(CacheItemPriority.Normal);

        _memoryCache.Set(cacheKey, events, cacheEntryOptions);
    }

}