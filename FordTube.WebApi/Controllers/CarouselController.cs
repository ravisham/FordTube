using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using FordTube.VBrick.Wrapper.Enums;
using FordTube.VBrick.Wrapper.Models;
using Microsoft.AspNetCore.Mvc;
using OneMagnify.Data.Ford.FordTube.Repositories;
using ImageMagick;
using Microsoft.Extensions.Configuration;
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Common.Extensions;
using FordTube.WebApi.Authentication;

using OneMagnify.Data.Ford.FordTube.Entities.Enums;


namespace FordTube.WebApi.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class CarouselController : ControllerBase
    {

        private readonly ISlideRepository _slideRepository;

        private readonly IConfiguration _configuration;

        public CarouselController(ISlideRepository slideRepository, IConfiguration configuration)
        {
            _slideRepository = slideRepository;
            _configuration = configuration;
        }


        // GET: api/Carousel/GetActive/0
        [HttpGet]
        [Route("GetActive/{franchise}")]
        public async Task<IEnumerable<Slide>> GetActive(int franchise)
        {
            if (franchise == (int) FranchiseType.Lincoln) { return await _slideRepository.GetActiveLincolnSlidesAsync(); }

            return await _slideRepository.GetActiveFordSlidesAsync();
        }


        // GET: api/Carousel/GetAll/0
        [HttpGet]
        [Route("GetAll/{franchise}")]
        public async Task<IEnumerable<Slide>> GetAll(int franchise)
        {
            if (franchise == (int) FranchiseType.Lincoln) { return await _slideRepository.GetAllLincolnSlidesAsync(); }

            return await _slideRepository.GetAllFordSlidesAsync();
        }


        // GET: api/Carousel/5
        [HttpGet("{id}", Name = "Get")]
        public ValueTask<Slide> Get(int id) => _slideRepository.GetAsync(id);


        // POST: api/Carousel
        [HttpPost]
        [AuthorizeUserRole(UserRoleEnum.SUPER_ADMIN)]
        public async Task<IEnumerable<Slide>> Post([FromBody] SlideDtoModel slide) {
            var franchise = slide.Franchise;

            var imageName = await SaveImage(slide.BackgroundImage);

            var slideToCreate = slide.ToSlide();

            slideToCreate.BackgroundImageUrl = imageName;

            // Save new Slide
            await _slideRepository.AddAsync(slideToCreate);

            if (franchise == (int) FranchiseType.Lincoln) { return await _slideRepository.GetAllLincolnSlidesAsync(); }

            return await _slideRepository.GetAllFordSlidesAsync();
        }


        // PUT: api/Carousel/5
        [HttpPut("{id}")]
        [AuthorizeUserRole(UserRoleEnum.SUPER_ADMIN)]
        public async Task<IEnumerable<Slide>> Put(int id, [FromBody] SlideDtoModel slide)
        {
            var originalSlide = await _slideRepository.GetAsync(id);

            var slideToSave = slide.ToSlide();

            slideToSave.Id = originalSlide.Id;

            if (slide.BackgroundImageUrl.IsNullOrEmpty() && !slide.BackgroundImage.IsNullOrEmpty())
            {
                slideToSave.BackgroundImageUrl = await SaveImage(slide.BackgroundImage);
            }

            await _slideRepository.UpdateAsync(slideToSave, id);

            if (originalSlide.Franchise == (int) FranchiseType.Lincoln) { return await _slideRepository.GetAllLincolnSlidesAsync(); }

            return await _slideRepository.GetAllFordSlidesAsync();
        }


        // DELETE: api/Carousel/Delete/5
        [HttpDelete("{id}", Name = "Delete")]
        [AuthorizeUserRole(UserRoleEnum.SUPER_ADMIN)]
        public async Task<IEnumerable<Slide>> Delete(int id)
        {
            var slide = await _slideRepository.GetAsync(id);

            await _slideRepository.DeleteAsync(slide);

            if (slide.Franchise == (int) FranchiseType.Lincoln) { return await _slideRepository.GetAllLincolnSlidesAsync(); }

            return await _slideRepository.GetAllFordSlidesAsync();
        }


        private async Task<string> SaveImage(byte[] imageData)
        {
            var filePath = _configuration.GetSection("UploadPath").Value + "/";

            var fileName = $"{Guid.NewGuid()}";

            var fullFileName = $"{filePath}{fileName}.jpg";

            try
            {
                using (var imageFile = new FileStream(fullFileName, FileMode.Create))
                {
                    await imageFile.WriteAsync(imageData, 0, imageData.Length);

                    imageFile.Flush();
                }

                var optimizer = new ImageOptimizer();

                optimizer.LosslessCompress(new FileInfo(fullFileName));
            }
            catch (Exception exception) { throw new HttpRequestException("Unable to compress and save image.", exception.InnerException); }

            return $"{fileName}.jpg";
        }

    }

}


