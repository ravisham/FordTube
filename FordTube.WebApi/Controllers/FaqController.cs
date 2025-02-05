// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace FordTube.WebApi.Controllers
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class FaqController : ControllerBase
    {
        private readonly IFaqGroupRepository _faqGroupRepository;

        private readonly IFaqRepository _faqRepository;

        public FaqController(IFaqGroupRepository faqGroupRepository, IFaqRepository faqRepository)
        {
            _faqGroupRepository = faqGroupRepository;
            _faqRepository = faqRepository;
        }


        /// <summary> Get FAQ questions </summary>
        [SwaggerResponse((int) HttpStatusCode.OK, Type = typeof(Faq[]))]
        [HttpGet]
        [Route("get")]
        [AllowAnonymous]
        public async Task<IActionResult> Get()
        {
            var faqs = await _faqRepository.GetAllAsync();

            return Ok(faqs);
        }

        /// <summary> Get FAQ questions </summary>
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(FaqGroup[]))]
        [HttpGet]
        [Route("groups")]
        [AllowAnonymous]
        public async Task<IActionResult> Groups(int franchiseId)
        {
            var faqGroups = await _faqGroupRepository.GetFaqGroupsByFranchise(franchiseId);

            return Ok(faqGroups);
        }

    }

}