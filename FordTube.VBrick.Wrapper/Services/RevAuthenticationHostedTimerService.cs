using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace FordTube.VBrick.Wrapper.Services {

    public class RevAuthenticationHostedTimerService : IHostedService, IDisposable {

        private readonly IRevAuthenticationService _authenticationService;


        private readonly ILogger<RevAuthenticationHostedTimerService> _logger;


        private int _authenticateCount;


        private Timer _reAuthenticationTimer;


        public RevAuthenticationHostedTimerService(ILogger<RevAuthenticationHostedTimerService> logger, IRevAuthenticationService authenticationService)
        {
            _logger = logger;
            _authenticationService = authenticationService;
        }


        public void Dispose() { _reAuthenticationTimer?.Dispose(); }


        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Rev Authentication Hosted Timer-Service running.");

            // Authenticate with Rev on Application Start
            _authenticationService.AuthenticateAsync().Wait(stoppingToken);


            // Get a fresh Rev Token every 3 minutes
            _reAuthenticationTimer = new Timer(ReAuthenticate, null, TimeSpan.Zero, TimeSpan.FromMinutes(3));

            return Task.CompletedTask;
        }


        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Rev Authentication Hosted Timer-Service is stopping.");

            _reAuthenticationTimer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }


        private void ReAuthenticate(object state)
        {
            _authenticationService.AuthenticateAsync().Wait();

            var count = Interlocked.Increment(ref _authenticateCount);

            _logger.LogInformation("Rev Authentication Hosted Timer-Service is working. Re-authentication Count: {Count}", count);
        }

    }

}