const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'development';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const H2o2 = require('@hapi/h2o2');
const Jwt = require('@hapi/jwt');
const routes = require('./routes/routes');

require('./db');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  await server.register(Inert);
  await server.register(H2o2);
  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_SECRET_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 60 * 60,
      timeSkewSec: 15,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { user: artifacts.decoded.payload },
    }),
  });

  server.auth.default('jwt');
  server.route(routes);

  await server.start();
  console.log(`Server running on ${server.info.uri} with "${process.env.NODE_ENV}" environment`);
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log the error and prevent the process from crashing
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Log the error and prevent the process from crashing
});

module.exports = init();
