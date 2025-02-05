---
title: Event Management
---
# Introduction

This document will walk you through the "Event Management" feature in the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="23:2:2" line-data="namespace FordTube.WebApi.Controllers;">`FordTube`</SwmToken> Web API. The purpose of this feature is to manage events, including listing, creating, editing, and retrieving event details. We will cover:

1. How the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="29:4:4" line-data="public class EventsController : ControllerBase {">`EventsController`</SwmToken> is structured and its dependencies.
2. The process of listing events and handling caching.
3. The creation and management of events using the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="88:35:35" line-data="            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, &quot;Error retrieving events from VBrick API.&quot;); }">`VBrick`</SwmToken> API.
4. The validation and utility functions used within the controller.

# Controller structure and dependencies

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="20">

---

The <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="29:4:4" line-data="public class EventsController : ControllerBase {">`EventsController`</SwmToken> is the main entry point for handling event-related requests. It is defined with necessary attributes for routing and CORS policy.

```
using CalendarEventModel = OneMagnify.Calendar.EventGenerator.Models.CalendarEventModel;


namespace FordTube.WebApi.Controllers;

[Produces("application/json")]
[Route("api/[controller]")]
[EnableCors("CORS_POLICY")]
[ApiController]
public class EventsController : ControllerBase {
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="43">

---

The controller relies on several dependencies, which are injected through its constructor. These include providers for calendar events, <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="88:35:35" line-data="            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, &quot;Error retrieving events from VBrick API.&quot;); }">`VBrick`</SwmToken> API interactions, logging, memory caching, and configuration settings.

```
    private readonly IVBrickApiRepository _vbrickApi;


    public EventsController(ICalendarProvider calendarProvider, IVBrickApiRepository vbrickApi, ILogger<EventsController> logger, IMemoryCache memoryCache, IConfiguration configuration)
    {
        _calendarProvider = calendarProvider;
        _vbrickApi = vbrickApi;
        _logger = logger;
        _memoryCache = memoryCache;
        _configuration = configuration;
    }
```

---

</SwmSnippet>

# Listing events and caching

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="70">

---

The `List` method handles the retrieval of scheduled events. It first validates the franchise value to ensure it is acceptable.

```
        // Validate the franchise value
        if (!IsValidFranchise(franchise))
        {
            _logger.LogWarning("Invalid franchise value received: {Franchise}", franchise);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="78">

---

If the franchise is valid, the method checks the cache for existing events. If a cache miss occurs, it configures the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="88:35:35" line-data="            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, &quot;Error retrieving events from VBrick API.&quot;); }">`VBrick`</SwmToken> API and retrieves events.

```
        var cacheKey = GetCacheKey(franchise);

        if (!_memoryCache.TryGetValue(cacheKey, out EventModel[] cachedEvents))
        {
            _logger.LogInformation("Cache miss for franchise: {Franchise}", franchise);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="88">

---

Events are retrieved and cached if available. If no events are found, an empty list is returned.

```
            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, "Error retrieving events from VBrick API."); }

            if (allEvents.Count > 0)
            {
                CacheEvents(cacheKey, allEvents.ToArray(), franchise);
                cachedEvents = allEvents.ToArray();
            }
            else
            {
                _logger.LogInformation("No events to cache for franchise: {Franchise}", franchise);
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="102">

---

If events are found in the cache, they are served directly from there.

```
        else { _logger.LogInformation("Serving from cache for franchise: {Franchise}. Cached events count: {Count}", franchise, cachedEvents.Length); }

        return Ok(cachedEvents);
    }
```

---

</SwmSnippet>

# Event creation and management

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="108">

---

The <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="116:10:10" line-data="    public async Task&lt;IActionResult&gt; Add([FromBody] CreateEventModel model)">`Add`</SwmToken> method allows for the creation of new events. It sets up the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="88:35:35" line-data="            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, &quot;Error retrieving events from VBrick API.&quot;); }">`VBrick`</SwmToken> API configuration and creates the event using the provided model.

```
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
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="146">

---

Similarly, the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="149:3:3" line-data="    ///     Edit event">`Edit`</SwmToken> and <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="173:10:10" line-data="    public async Task&lt;IActionResult&gt; EditAccess(string id, [FromBody] EditEventAccessControlModel model)">`EditAccess`</SwmToken> methods update existing events and their access controls, respectively.

```
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
```

---

</SwmSnippet>

# Utility functions

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="216">

---

The controller includes utility functions for validating franchises, generating cache keys, and configuring the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="88:35:35" line-data="            if (allEvents == null) { return StatusCode((int) HttpStatusCode.InternalServerError, &quot;Error retrieving events from VBrick API.&quot;); }">`VBrick`</SwmToken> API. These functions support the main operations of the controller.

```
    /// <summary>
    /// Validates if the given franchise is valid.
    /// </summary>
    /// <param name="franchise">The franchise to validate.</param>
    /// <returns>True if the franchise is valid, false otherwise.</returns>
    private static bool IsValidFranchise(string franchise)
    {
        var validFranchises = new[] { "Ford", "Lincoln", "Both" };
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="229">

---

The <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="234:7:7" line-data="    private static string GetCacheKey(string franchise) { return $&quot;scheduled-events-{franchise.ToLower()}&quot;; }">`GetCacheKey`</SwmToken> function generates a unique key for caching based on the franchise.

```
    /// <summary>
    /// Generates the cache key based on the franchise.
    /// </summary>
    /// <param name="franchise">The franchise name.</param>
    /// <returns>A cache key string.</returns>
    private static string GetCacheKey(string franchise) { return $"scheduled-events-{franchise.ToLower()}"; }
```

---

</SwmSnippet>

<SwmSnippet path="/FordTube.WebApi/Controllers/EventsController.cs" line="237">

---

The <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="241:10:10" line-data="    private async Task&lt;bool&gt; ConfigureVBrickApi()">`ConfigureVBrickApi`</SwmToken> function ensures the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="238:7:7" line-data="    /// Configures the VBrick API.">`VBrick`</SwmToken> API is properly set up before making requests.

```
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
```

---

</SwmSnippet>

# Conclusion

This walkthrough has covered the main components and logic of the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="29:4:4" line-data="public class EventsController : ControllerBase {">`EventsController`</SwmToken> in the <SwmToken path="/FordTube.WebApi/Controllers/EventsController.cs" pos="23:2:2" line-data="namespace FordTube.WebApi.Controllers;">`FordTube`</SwmToken> Web API. The design decisions focus on efficient event management through caching, validation, and API interactions.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBRm9yZFR1YmUlM0ElM0FyYXZpc2hhbQ==" repo-name="FordTube"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
