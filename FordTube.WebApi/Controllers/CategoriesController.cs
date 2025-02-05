// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FordTube.VBrick.Wrapper;
using FordTube.VBrick.Wrapper.Enums;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.WebApi.Authentication;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using OneMagnify.Data.Ford.FordTube.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {

        private readonly IVbrickMappingRepository _mappingRepository;
        private readonly IVBrickApiRepository _vbrickApi;
        private readonly IMemoryCache _memoryCache;
        public string categorycacheKey = "categories";


        public CategoriesController(IVbrickMappingRepository mappingRepository, IVBrickApiRepository vbrickApi, IMemoryCache memoryCache)
        {
            _mappingRepository = mappingRepository;

            _vbrickApi = vbrickApi;
            _memoryCache = memoryCache;
        }

        /// <param name="id"> </param>
        /// <summary>
        ///     Delete Category
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(bool))]
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
        ///     Add Category
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(string))]
        [HttpPost]
        [Route("add")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Add([FromBody] AddCategoryRequestModel model)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.AddCategory(model);

            return Ok(response.CategoryId);
        }


        /// <summary>
        ///     Get All Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(GetCategoryModel[]))]
        [HttpGet]
        [Route("get")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Get()
        {
            await _vbrickApi.SetConfigVBrickApi();
            GetCategoriesModel response;
            if (!_memoryCache.TryGetValue(categorycacheKey, out response))
            {
                response = await _vbrickApi.GetFilteredCategories();
                _memoryCache.Set(categorycacheKey, response,
                    new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30)));
            }

            return Ok(response.Categories);
        }

        /// <summary>
        ///     Get Children Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(GetCategoryModel[]))]
        [HttpGet]
        [Route("children/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetChildren(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            GetCategoriesModel response;
            if (!_memoryCache.TryGetValue(id, out response))
            {
                response = await _vbrickApi.GetChildrenCategories(id);
                _memoryCache.Set(id, response,
                    new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30)));
            }

            return Ok(response.Categories);
        }

        /// <summary>
        ///     Get Root Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(GetCategoryModel[]))]
        [HttpGet]
        [Route("get-root")]
        [ResponseCache(Duration = 180)]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> GetRoot()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = await _vbrickApi.GetFilteredCategories();
            response.Categories = response.Categories.ToList().Where(c => !c.Fullpath.Contains("/")).ToArray();
            return Ok(response.Categories);
        }


        /// <summary>
        ///     Get All Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(GetCategoryModel[]))]
        [HttpGet]
        [Route("franchise")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        [ResponseCache(Duration = 180)]
        public async Task<IActionResult> GetFranchise()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var response = _vbrickApi.GetFranchiseCategoriesAsync();

            return Ok(response);
        }


        /// <param name="id"> </param>
        /// <summary>
        ///     Get All Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(GetCategoryModel))]
        [HttpGet]
        [ResponseCache(Duration = 180)]
        [Route("category/{id}")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> Category(string id)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var categories = await _vbrickApi.GetCategories();
            var response = categories.Categories.ToList().FirstOrDefault(c => c.CategoryId == id);

            return Ok(response);
        }

        /// <param name="id"></param>
        /// <summary>
        ///     Get All Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(GetCategoryModel[]))]
        [HttpPut]
        [Route("franchise-categories")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> FranchiseCategories([FromBody] FranchiseType franchise)
        {
            await _vbrickApi.SetConfigVBrickApi();
            var categories = await _vbrickApi.GetCategoriesByFranchise(franchise);
            return Ok(categories);
        }

        /// <param name="id"></param>
        /// <summary>
        ///     Get All Categories
        /// </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(HomePageCategoryModel[]))]
        [HttpGet]
        [ResponseCache(Duration = 180)]
        [Route("homepage-categories")]
        [ServiceFilter(typeof(BasicAuthenticationFilterAttribute))]
        public async Task<IActionResult> HomePageCategories()
        {
            await _vbrickApi.SetConfigVBrickApi();
            var categories = await _vbrickApi.GetHomePageCategories();
            return Ok(categories);
        }

    }

}