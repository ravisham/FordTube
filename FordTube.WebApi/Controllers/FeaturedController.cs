// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FordTube.VBrick.Wrapper;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class FeaturedController : ControllerBase
    {
        private readonly IVbrickMappingRepository _mappingRepository;



        private readonly IVideoRatingRepository _videoRatingRepository;
        private readonly IVBrickApiRepository _vbrickApi;

        public FeaturedController( 
        IVbrickMappingRepository mappingRepository, 
       
        IVideoRatingRepository videoRatingRepository, IVBrickApiRepository vbrickApi)
        {
            _mappingRepository = mappingRepository;
            _videoRatingRepository = videoRatingRepository;
            
            _vbrickApi = vbrickApi;
        }

        /// <summary>
        ///     Get All Featured Categories
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(GetCategoryModel[]))]
        [HttpGet]
        [Route("get")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Get()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetFeaturedCategories();

            return Ok(response);
        }


        /// <param name="model"> </param>
        /// <summary>
        ///     Get All Featured Category Videos
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(VideoSearchResponseModel[]))]
        [HttpPost]
        [Route("videos")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Videos([FromBody] FeaturedVideosRequestModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetFeaturedVideos(model);
            var videos = _videoRatingRepository.FindBy(v => response.Videos.Any(rv => rv.Id == v.VideoId)).ToList();
            FillRatings(videos, response);
            return Ok(response);
        }

        private static void FillRatings(List<VideoRating> videos, VideoSearchResponseModel response)
        {
            foreach (var video in response.Videos)
            {
                var dbVideo = videos.FirstOrDefault(v => video.Id == v.VideoId);
                video.AverageRating = dbVideo == null ? 0 : (float)dbVideo.AvgRating;
            }
        }


        /// <param name="id"> </param>
        /// <summary>
        ///     Delete Featured Category
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(bool))]
        [HttpDelete]
        [Route("delete/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Delete(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            await _vbrickApi.DeleteCategory(id);

            return Ok();
        }


        /// <param name="model"> </param>
        /// <summary>
        ///     Add Featured Category
        /// </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Add([FromBody] AddFeaturedCategoryModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddFeaturedCategory(model.Name);

            return Ok(response.CategoryId);
        }

    }

}