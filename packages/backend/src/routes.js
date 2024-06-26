const Joi = require('joi');
const {
  getLandingPageHandler, postLoginHandler, getProfileHandler, postRefreshTokenHandler,
  failActionHandler,
} = require('./handler');
const { loginSchema, refreshSchema } = require('./schema');

const routes = [
  {
    method: 'GET',
    path: '/{param*}',
    options: {
      auth: false,
    },
    handler: getLandingPageHandler(),
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      auth: false,
      validate: {
        payload: loginSchema, 
      },
    },
    handler: postLoginHandler,
  },
  {
    method: 'POST',
    path: '/refresh-token',
    options: {
      auth: false,
      validate: {
        payload: refreshSchema,
      },
    },
    handler: postRefreshTokenHandler,
  },
  {
    method: 'GET',
    path: '/profile',
    options: {
      auth: 'jwt',
    },
    handler: getProfileHandler,
  },
];

module.exports = routes;
