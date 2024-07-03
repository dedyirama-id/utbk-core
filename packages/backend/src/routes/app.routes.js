const { getLandingPageHandler } = require('../handler/static-handler');

const appRoutes = [
  {
    method: 'GET',
    path: '/{param*}',
    options: {
      auth: false,
    },
    handler: getLandingPageHandler(),
  },
];

module.exports = appRoutes;
