const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const Inert = require('@hapi/inert');
const H2o2 = require('@hapi/h2o2');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost'
  });

  await server.register(Inert);
  await server.register(H2o2);

  server.route(routes);

  await server.start();
  console.log(`Server running on ${server.info.uri} with "${process.env.NODE_ENV}" environment`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

module.exports = init();
