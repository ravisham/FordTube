// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited.

#region Usings

using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Repositories;
using OneMagnify.Xapi.Services;
using Swashbuckle.AspNetCore.Annotations;

#endregion


namespace FordTube.WebApi.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("CORS_POLICY")]
    [ApiController]
    public class XapiController : ControllerBase
    {

        private readonly ILogger _logger;

        private readonly IXapiService _xapiService;

        private readonly IXapiProblematicStatementRepository _xapiProblematicRepository;


        public XapiController(IXapiService xapiService, ILogger<XapiController> logger, IXapiProblematicStatementRepository xapiProblematicRepository)
        {
            _xapiService = xapiService;
            _logger      = logger;
            _xapiProblematicRepository = xapiProblematicRepository;
        }


        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(IActionResult))]
        [HttpPost]
        [Route("statements")]
        public async Task<IActionResult> Statements([FromBody] object statement)
        {

            if (statement == null || statement.ToString().Equals("{}"))
            {
                _logger.LogWarning("Empty Statement has been passed to the 'Statements' method within the XapiController class.\r\n");

                return null;
            }

            _logger.LogWarning("The following object was sent to the 'Statements' method within the xAPIController class.\r\n {0}", JsonConvert.SerializeObject(statement));

            var response = await _xapiService.PostStatementAsync(statement);

            if (response.IsSuccessStatusCode) return Ok();

            await _xapiProblematicRepository.AddAsync(new XapiProblematicStatement()
            {
                Statement = JsonConvert.SerializeObject(statement),
                ErrorDateTime = DateTime.Now
            });

            return null;

        }


        
        [SwaggerResponse((int)HttpStatusCode.OK, Type = typeof(IActionResult))]
        [HttpGet]
        [Route("TriggerFailure")]
        public async Task<IActionResult> TriggerFailure(int code = 0)
        {

            if (code != 9999)
            {
                _logger.LogWarning("Invalid code provided to 'TriggerFailure' xAPI controller endpoint, ensure this is not an attack.\r\n");

                return BadRequest();
            }
            
            var response = await _xapiProblematicRepository.AddAsync(new XapiProblematicStatement()
            {
                Statement = JsonConvert.SerializeObject(new { Test = "This is a test failed statement triggered via the 'TriggerFailure' endpoint." }),
                ErrorDateTime = DateTime.Now
            });

            if (!DateTime.TryParse(response.ErrorDateTime.ToString(), out _))
            {
                return BadRequest("We couldn't successfully store the 'xAPIInvalidStatement' upon failure to communicate with the LRS.");
            }

            return Ok(response);

        }

    }

}