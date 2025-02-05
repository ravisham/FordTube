const { env } = require('process');

const targetApi = 'https://localhost:6969';
const targetSpa = 'https://localhost:5001';

const PROXY_CONFIG = [
  {
    context: [
      "/api/**", // Proxy all API requests to the API server
    ],
    target: targetApi,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: [
      "/signin-oidc",
      "/", // Handle all other routes with the SPA server
      "!/api/**" // Exclude API requests from being handled by the SPA
    ],
    target: targetSpa,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    bypass: function (req, res, proxyOptions) {
      // Serve index.html for non-API and non-static file requests
      if (req.headers.accept && req.headers.accept.includes('html')) {
        return '/index.html';
      }
    }
  }
];

module.exports = PROXY_CONFIG;
