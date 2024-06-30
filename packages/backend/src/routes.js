const { getLandingPageHandler } = require("./handler");

const routes = [
  {
    method: 'GET',
    path: '/{param*}',
    handler: getLandingPageHandler(),
  },
  
];

module.exports = routes;
