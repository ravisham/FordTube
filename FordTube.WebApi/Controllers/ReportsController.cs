using System.Globalization;
using System.Net;
using System.Text;

using CsvHelper;

using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using FordTube.WebApi.Models;
using FordTube.WebApi.Models.Mongo;

using Microsoft.AspNetCore.Mvc;

using MongoDB.Driver;

using OneMagnify.Data.Ford.FordTube.Entities.Enums;


namespace FordTube.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{

    private readonly ILogger<ReportsController> _logger;


    private readonly IMongoCollection<MongoTaskModel> _tasksCollection;


    private readonly IVBrickApiRepository _vbrickApi;


    private readonly IMongoCollection<MongoVideoModel> _videosCollection;

    private readonly IConfiguration _configuration;

    /// <summary>
    ///     Initializes a new instance of the <see cref="ReportsController" /> class.
    /// </summary>
    /// <param name="mongoClient">The MongoDB client.</param>
    /// <param name="vbrickApi">The VBrick API repository.</param>
    /// <param name="logger">The logger instance.</param>
    public ReportsController(IMongoClient mongoClient, IVBrickApiRepository vbrickApi, ILogger<ReportsController> logger, IConfiguration configuration)
    {
        _vbrickApi = vbrickApi;
        _logger = logger;
        _configuration = configuration;
        var database = mongoClient.GetDatabase(_configuration["MongoDatabaseName"]);
        _videosCollection = database.GetCollection<MongoVideoModel>("videos");
        _tasksCollection = database.GetCollection<MongoTaskModel>("tasks");

    }


    /// <summary>
    ///     Endpoint for generating the active video report.
    /// </summary>
    /// <returns>A <see cref="FileContentResult" /> containing the active video report as a CSV file.</returns>
    [HttpGet("download/active")]
    [AuthorizeUserRole(UserRoleEnum.SUPER_ADMIN)]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> GetActiveVideoReport()
    {
        try
        {
            _logger.LogInformation("Starting generation of the active video report.");

            var filter = Builders<MongoVideoModel>.Filter.Eq(v => v.IsActive, true);
            var videos = await _videosCollection.Find(filter).ToListAsync();
            _logger.LogInformation("Retrieved {Count} active videos from MongoDB.", videos.Count);
            MongoVideoCustomField customUploadDateFieldId = new MongoVideoCustomField();
            var reportDataTasks = videos.Select(async video =>
            {
                try
                {
                    var currentYear = DateTime.UtcNow.Year;

                    // Determine Views Since Published
                    int viewsSincePublished;
                    var earliestDate = DateTime.UtcNow;

                    customUploadDateFieldId = video.CustomFields.Find(x => x.Name == "UploadDateFieldId");
                    if (!String.IsNullOrEmpty(customUploadDateFieldId.Value))
                    {
                        earliestDate = video.WhenUploaded > Convert.ToDateTime(customUploadDateFieldId.Value) ? Convert.ToDateTime(customUploadDateFieldId.Value) : video.WhenUploaded;
                        viewsSincePublished = await GetViewsSincePublishedFromApi(video.VideoId, earliestDate);
                    }
                    else
                    {
                        earliestDate = video.WhenUploaded < video.LastPublished ? video.WhenUploaded : video.LastPublished;
                        viewsSincePublished = await GetViewsSincePublishedFromApi(video.VideoId, earliestDate);
                    }

                    // Calculate Current YTD Views using the Summary Statistics API
                    var currentYtdViews = await _vbrickApi.GetViewCountForPeriod(video.VideoId, new DateTime(currentYear, 1, 1), DateTime.UtcNow);

                    // Calculate Last 30 Days Views by fetching it from the Summary Statistics API
                    var last30DaysViews = await GetLast30DaysViewsFromApi(video.VideoId);

                    // Ensure Current YTD Views does not exceed Views Since Published
                    if (currentYtdViews > viewsSincePublished)
                    {
                        _logger.LogWarning("Adjusting Current YTD Views for video {VideoId} as it exceeds Views Since Published.", video.VideoId);
                        currentYtdViews = viewsSincePublished;
                    }

                    return new ActiveVideoReport
                    {
                        VideoId = video.VideoId,
                        VideoTitle = video.Title,
                        UploadDate = video.WhenUploaded,
                        PublishDate = video.LastPublished,
                        ModifyDate = video.LastModified,
                        Last30DaysViews = last30DaysViews,
                        CurrentYTDViews = currentYtdViews,
                        ViewsSincePublished = viewsSincePublished
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calculating views for video {VideoId} - {VideoTitle}.", video.VideoId, video.Title);

                    return null;
                }
            });

            var reportData = (await Task.WhenAll(reportDataTasks)).Where(r => r != null).ToList();
            _logger.LogInformation("Successfully generated report data for {Count} videos.", reportData.Count);

            var csvData  = GenerateActiveCsv(reportData);
            var csvBytes = Encoding.UTF8.GetBytes(csvData);
            var result   = new FileContentResult(csvBytes, "text/csv") { FileDownloadName = "ActiveVideoReport.csv" };

            _logger.LogInformation("Active video report generated successfully.");

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate the active video report.");

            return StatusCode((int) HttpStatusCode.InternalServerError, "An error occurred while generating the report.");
        }
    }


    /// <summary>
    ///     Endpoint for generating the inactive or deleted video report.
    /// </summary>
    /// <returns>A <see cref="FileContentResult" /> containing the inactive or deleted video report as a CSV file.</returns>
    [HttpGet("download/inactive-deleted")]
    [AuthorizeUserRole(UserRoleEnum.SUPER_ADMIN)]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> GetInactiveDeletedVideoReport()
    {
        try
        {
            _logger.LogInformation("Starting generation of the inactive/deleted video report.");

            var filter = Builders<MongoVideoModel>.Filter.Eq(v => v.IsActive, false);
            var videos = await _videosCollection.Find(filter).ToListAsync();
            _logger.LogInformation("Retrieved {Count} inactive/deleted videos from MongoDB.", videos.Count);
            MongoVideoCustomField customUploadDateFieldId = new MongoVideoCustomField();
            var reportDataTasks = videos.Select(async video =>
            {
                try
                {
                    var currentYear = DateTime.UtcNow.Year;

                    // Determine Views Since Published
                    int viewsSincePublished = 0;
                    var earliestDate = DateTime.UtcNow;

                    if (video.Details != null)
                    {
                        customUploadDateFieldId = video.CustomFields.Find(x => x.Name == "UploadDateFieldId");
                        if (!String.IsNullOrEmpty(customUploadDateFieldId.Value))
                        {
                            earliestDate = video.WhenUploaded > Convert.ToDateTime(customUploadDateFieldId.Value) ? Convert.ToDateTime(customUploadDateFieldId.Value) : video.WhenUploaded;
                            video.Details.TotalViews = await GetViewsSincePublishedFromApi(video.VideoId, earliestDate);
                        }
                        else
                        {
                            earliestDate = video.WhenUploaded < video.LastPublished ? video.WhenUploaded : video.LastPublished;
                            video.Details.TotalViews = await GetViewsSincePublishedFromApi(video.VideoId, earliestDate);
                        }
                    }
                    return new InactiveDeletedVideoReport
                    {
                        VideoId = video.VideoId,
                        VideoTitle = video.Title,
                        UploadDate = video.WhenUploaded,
                        PublishDate = video.LastPublished,
                        ModifyDate = video.LastModified,
                        ViewsSincePublished = viewsSincePublished.ToString()
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calculating views for video {VideoId} - {VideoTitle}.", video.VideoId, video.Title);

                    return null;
                }
            });

            var reportData = (await Task.WhenAll(reportDataTasks)).Where(r => r != null).ToList();

            var videoIds = videos.Select(v => v.VideoId).ToList();
            var tasks    = await _tasksCollection.Find(t => videoIds.Contains(t.VideoId)).ToListAsync();
            _logger.LogInformation("Retrieved {Count} tasks from MongoDB.", tasks.Count);

            var mergedData = from video in videos join task in tasks on video.VideoId equals task.VideoId into taskGroup from task in taskGroup.DefaultIfEmpty() select new MongoVideoTaskData { Video = video, Task = task };

            _logger.LogInformation("Merged video and task data.");

            var csvData  = GenerateInactiveDeletedCsv(mergedData.ToList());
            var csvBytes = Encoding.UTF8.GetBytes(csvData);
            var result   = new FileContentResult(csvBytes, "text/csv") { FileDownloadName = "InactiveDeletedVideoReport.csv" };

            _logger.LogInformation("Inactive/deleted video report generated successfully.");

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate the inactive/deleted video report.");

            return StatusCode((int) HttpStatusCode.InternalServerError, "An error occurred while generating the report.");
        }
    }


    /// <summary>
    ///     Gets the views for the past 30 days from the API.
    /// </summary>
    /// <param name="videoId">The video identifier.</param>
    /// <returns>The total views for the past 30 days.</returns>
    private async Task<int> GetLast30DaysViewsFromApi(string videoId)
    {
        try
        {
            _logger.LogInformation("Fetching views for the past 30 days for video {VideoId}.", videoId);
            var endDate   = DateTime.UtcNow;
            var startDate = endDate.AddDays(-30);
            var viewCount = await _vbrickApi.GetViewCountForPeriod(videoId, startDate, endDate);
            _logger.LogInformation("Retrieved {ViewCount} views for the past 30 days for video {VideoId}.", viewCount, videoId);

            return viewCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve views for the past 30 days for video {VideoId}.", videoId);

            throw;
        }
    }


    /// <summary>
    ///     Gets the views since the earliest available date from the API.
    /// </summary>
    /// <param name="videoId">The video identifier.</param>
    /// <param name="earliestDate">The earliest date to start counting views from.</param>
    /// <returns>The total views since the earliest available date.</returns>
    private async Task<int> GetViewsSincePublishedFromApi(string videoId, DateTime earliestDate)
    {
        try
        {
            _logger.LogInformation("Fetching views since {EarliestDate} for video {VideoId}.", earliestDate, videoId);
            var viewCount = await _vbrickApi.GetViewCountForPeriod(videoId, earliestDate, DateTime.UtcNow);
            _logger.LogInformation("Retrieved {ViewCount} views since {EarliestDate} for video {VideoId}.", viewCount, earliestDate, videoId);

            return viewCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve views since {EarliestDate} for video {VideoId}.", earliestDate, videoId);

            throw;
        }
    }


    /// <summary>
    ///     Formats the date for CSV.
    /// </summary>
    /// <param name="date">The date.</param>
    /// <returns>A formatted date string for CSV.</returns>
    private static string FormatDateForCsv(DateTime? date)
    {
        if (!date.HasValue || date.Value == DateTime.MinValue || date.Value == DateTime.MaxValue || date.Value == default) return string.Empty;

        return date.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }


    /// <summary>
    ///     Generates the CSV for the active video report.
    /// </summary>
    /// <param name="reportData">The report data.</param>
    /// <returns>A CSV string containing the active video report.</returns>
    private static string GenerateActiveCsv(List<ActiveVideoReport> reportData)
    {
        using var writer = new StringWriter();
        using var csv    = new CsvWriter(writer, CultureInfo.InvariantCulture);

        // Adding the report title and disclaimer
        writer.WriteLine("Active Video Report");
        writer.WriteLine($"*Note - Viewership reported is as of {DateTime.UtcNow.AddDays(-1):yyyy-MM-dd}");

        // Adding a blank line
        writer.WriteLine();

        // Write header as per the desired format
        csv.WriteField("Video ID");
        csv.WriteField("Video Title");
        csv.WriteField("Upload Date");
        csv.WriteField("Publish Date");
        csv.WriteField("Modify Date");
        csv.WriteField("Last 30 Days Views");
        csv.WriteField("Current YTD Views");
        csv.WriteField("Views since Published");
        csv.NextRecord();

        foreach (var record in reportData)
        {
            csv.WriteField(record.VideoId);
            csv.WriteField(record.VideoTitle);
            csv.WriteField(FormatDateForCsv(record.UploadDate));
            csv.WriteField(FormatDateForCsv(record.PublishDate));
            csv.WriteField(FormatDateForCsv(record.ModifyDate));
            csv.WriteField(record.Last30DaysViews);
            csv.WriteField(record.CurrentYTDViews);
            csv.WriteField(record.ViewsSincePublished);
            csv.NextRecord();
        }

        return writer.ToString();
    }


    /// <summary>
    ///     Generates the CSV for the inactive or deleted video report.
    /// </summary>
    /// <param name="mergedData">The merged data of videos and tasks.</param>
    /// <returns>A CSV string containing the inactive or deleted video report.</returns>
    private static string GenerateInactiveDeletedCsv(List<MongoVideoTaskData> mergedData)
    {
        using var writer = new StringWriter();
        using var csv    = new CsvWriter(writer, CultureInfo.InvariantCulture);

        // Adding the report title and disclaimer
        writer.WriteLine("InActive/Deleted Video Report");
        writer.WriteLine($"*Note - Viewership reported is as of {DateTime.UtcNow.AddDays(-1):yyyy-MM-dd}");

        // Adding a blank line
        writer.WriteLine();

        // Write header as per the desired format
        csv.WriteField("Video ID");
        csv.WriteField("Video Title");
        csv.WriteField("Upload Date");
        csv.WriteField("Publish Date");
        csv.WriteField("Modify Date");
        csv.WriteField("Inactive/Deleted Date");
        csv.WriteField("Scheduled Inactive/Delete Date");
        csv.WriteField("Views since Published");
        csv.NextRecord();

        // Group by video to ensure each video is listed only once
        var groupedData = mergedData.GroupBy(data => data.Video.VideoId).Select(group => new { group.First().Video, group.OrderBy(t => t.Task?.ScheduledActionDate ?? DateTime.MaxValue).FirstOrDefault()?.Task });

        foreach (var record in groupedData.Select(data => new InactiveDeletedVideoReport
        {
            VideoId = data.Video.VideoId,
            VideoTitle = data.Video.Title,
            UploadDate = data.Video.WhenUploaded,
            PublishDate = data.Video.LastPublished,
            ModifyDate = data.Video.LastModified,
            InactiveDeletedDate = data.Video.LastModified,
            ScheduledInactiveDeleteDate = data.Task?.ScheduledActionDate,
            ViewsSincePublished = data.Video.Details?.TotalViews.ToString() ?? "0"
        }))
        {
            csv.WriteField(record.VideoId);
            csv.WriteField(record.VideoTitle);
            csv.WriteField(FormatDateForCsv(record.UploadDate));
            csv.WriteField(FormatDateForCsv(record.PublishDate));
            csv.WriteField(FormatDateForCsv(record.ModifyDate));
            csv.WriteField(FormatDateForCsv(record.InactiveDeletedDate));
            csv.WriteField(FormatDateForCsv(record.ScheduledInactiveDeleteDate));
            csv.WriteField(record.ViewsSincePublished);
            csv.NextRecord();
        }

        return writer.ToString();
    }

}