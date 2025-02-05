// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Configuration;
using System.Net;
using System.Threading.Tasks;

using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using FordTube.WebApi.Models;
using FordTube.WebApi.Models.Enums;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using MongoDB.Bson;
using MongoDB.Driver;

using Newtonsoft.Json;

using OneMagnify.Data.Ford.FordTube.Repositories;
using OneMagnify.Ford.EntityInfo.Data.Repositories;
using OneMagnify.Ford.EntityInfo.Data.Repositories.Interfaces;
using OneMagnify.Xapi.Services;

using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{
    [Produces("application/json")]
    [Route("health")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly IFordEntityInfoDbHealthCheckRepository _starsRepository;
        private readonly IXapiService _dataPowerXApiService;
        private readonly IFordTubeDbHealthCheckRepository _fordTubeDbHealthCheckRepository;
        private readonly IVBrickApiRepository _vbrickApi;
        private readonly IMongoClient _mongoClient;
        private readonly IConfiguration _configuration;

        public HealthController(
            IFordTubeDbHealthCheckRepository       fordTubeDbHealthCheckRepository,
            IFordEntityInfoDbHealthCheckRepository starsRepository,
            IVBrickApiRepository                   vbrickApi,
            IXapiService                           dataPowerXApiService,
            IMongoClient                           mongoClient,
            IConfiguration configuration)
        {
            _fordTubeDbHealthCheckRepository = fordTubeDbHealthCheckRepository;
            _starsRepository = starsRepository;
            _vbrickApi = vbrickApi;
            _dataPowerXApiService = dataPowerXApiService;
            _mongoClient = mongoClient;
            _configuration = configuration;
        }

        /// <summary>
        /// Health monitor - includes all results
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HealthModel))]
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = new HealthModel
            {
                VBrickStatus = await GetVbrickStatus(),
                FordInfoDbStatus = await GetFordInfoDatabaseStatus(),
                FordTubeDbStatus = await GetFordTubeDatabaseStatus(),
                DataPowerXApiStatus = await GetDataPowerXApiStatus(),
                MongoDbStatus = await GetMongoDbStatus()
            };

            return Ok(response);
        }

        /// <summary>
        /// Health monitor - health of the MongoDB connection
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HealthComponentModel))]
        [AllowAnonymous]
        [Route("mongodb")]
        [HttpGet]
        public async Task<IActionResult> MongoDb()
        {
            var response = await GetMongoDbStatus();
            return Ok(response);
        }

        /// <summary>
        /// Health monitor - health of the Data-Power/XApi Service 
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HealthComponentModel))]
        [AllowAnonymous]
        [Route("xapi")]
        [Route("datapower")]
        [HttpGet]
        public async Task<IActionResult> DataPowerXApiService()
        {
            var response = await GetDataPowerXApiStatus();
            return Ok(response);
        }

        /// <summary>
        /// Health monitor - health of the FordInfo database
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HealthComponentModel))]
        [AllowAnonymous]
        [Route("fordinfo")]
        [HttpGet]
        public async Task<IActionResult> FordInfoDatabase()
        {
            var response = await GetFordInfoDatabaseStatus();
            return Ok(response);
        }

        /// <summary>
        /// Health monitor - health of the FordTube database
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HealthComponentModel))]
        [AllowAnonymous]
        [Route("fordtube")]
        [HttpGet]
        public async Task<IActionResult> FordTubeDatabase()
        {
            var response = await GetFordTubeDatabaseStatus();
            return Ok(response);
        }

        /// <summary>
        /// Health monitor - health of the connection to Vbrick Rev platform
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HealthComponentModel))]
        [AllowAnonymous]
        [Route("vbrick")]
        [HttpGet]
        public async Task<IActionResult> Vbrick()
        {
            var response = await GetVbrickStatus();
            return Ok(response);
        }

        /// <summary>
        /// Check the status of Vbrick Rev platform
        /// </summary>
        private async Task<HealthComponentModel> GetVbrickStatus()
        {
            var response = new HealthComponentModel();

            try
            {
                await _vbrickApi.SetConfigVBrickApi();
                await _vbrickApi.GetCategories();
                response.Status = HealthStatusEnum.HEALTHY;
            }
            catch (Exception e)
            {
                response.Status = HealthStatusEnum.BROKEN;
                response.Message = e.Message;
            }

            return response;
        }

        /// <summary>
        /// Check the status of FordTube database
        /// </summary>
        private async Task<HealthComponentModel> GetFordTubeDatabaseStatus()
        {
            var response = new HealthComponentModel();

            try
            {
                var isConnected = await _fordTubeDbHealthCheckRepository.CanConnectAsync();
                response.Status = isConnected ? HealthStatusEnum.HEALTHY : HealthStatusEnum.BROKEN;
            }
            catch (Exception e)
            {
                response.Status = HealthStatusEnum.BROKEN;
                response.Message = e.Message;
            }

            return response;
        }

        /// <summary>
        /// Check the status of FordInfo database
        /// </summary>
        private async Task<HealthComponentModel> GetFordInfoDatabaseStatus()
        {
            var response = new HealthComponentModel();

            try
            {
                var isConnected = await _starsRepository.CanConnectAsync();
                response.Status = isConnected ? HealthStatusEnum.HEALTHY : HealthStatusEnum.BROKEN;
            }
            catch (Exception e)
            {
                response.Status = HealthStatusEnum.BROKEN;
                response.Message = e.Message;
            }

            return response;
        }


        /// <summary>
        /// Check the status of the MongoDB connection
        /// </summary>
        private async Task<HealthComponentModel> GetMongoDbStatus()
        {
            var response = new HealthComponentModel();

            try
            {
                // Attempt to ping the MongoDB server
                await _mongoClient.GetDatabase(_configuration["MongoDatabaseName"]).RunCommandAsync((Command<BsonDocument>)"{ping:1}");
                response.Status = HealthStatusEnum.HEALTHY;
            }
            catch (Exception e)
            {
                response.Status = HealthStatusEnum.BROKEN;
                response.Message = e.Message;
            }

            return response;
        }


        /// <summary>
        /// Check the status of DataPower XApi service
        /// </summary>
        private async Task<HealthComponentModel> GetDataPowerXApiStatus()
        {
            var response = new HealthComponentModel();
            const string payload = "{\"actor\":{\"name\":\"Test User\",\"objectType\":\"Agent\",\"account\":{\"homePage\":\"https://wslx.dealerconnection.com\",\"name\":\"t-user\"}},\"verb\":{\"id\":\"http://activitystrea.ms/schema/1.0/share\",\"display\":{\"en-US\":\"Service Test\"}},\"context\":{\"contextActivities\":{\"grouping\":[{\"id\":\"https://fordtube.dealerconnection.com\",\"definition\":{\"name\":{\"en-US\":\"Ford Tube\"},\"type\":\"http://activitystrea.ms/schema/1.0/organization\"},\"objectType\":\"Activity\"}],\"other\":[{\"id\":\"https://xapi.ford.com/extension/starsFlag\",\"objectType\":\"Activity\"}]},\"extensions\":{\"https://xapi.ford.com/extension/starsid\":\"000000000\"}},\"object\":{\"id\":\"https://xapi.ford.com/activities/fordtube/videos/a9c1c7d3-6f85-4b83-a281-385755eac1ef\",\"objectType\":\"Activity\",\"definition\":{\"name\":{\"en-US\":\"Business Update: July 8, 2022\"},\"type\":\"http://activitystrea.ms/schema/1.0/video\",\"description\":{\"en-US\":\"Business Update: July 8, 2022\"},\"moreInfo\":\"https://fordtube.dealerconnection.com/test\"}}}";

            try
            {
                var serialized = JsonConvert.DeserializeObject(payload);
                var responseFromDataPower = await _dataPowerXApiService.PostStatementAsync(serialized);

                if (!responseFromDataPower.IsSuccessStatusCode)
                {
                    response.Status = HealthStatusEnum.BROKEN;
                    response.Message = "xAPI Broken, Response from Datapower: " + responseFromDataPower.ReasonPhrase;
                }
                else
                {
                    response.Status = HealthStatusEnum.HEALTHY;
                }
            }
            catch (Exception e)
            {
                response.Status = HealthStatusEnum.BROKEN;
                response.Message = e.Message;
            }

            return response;
        }
    }
}
