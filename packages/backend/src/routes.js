const { getLandingPageHandler, postLoginHandler, getProfileHandler, postRefreshTokenHandler } = require("./handler");
const Joi = require('@hapi/joi');

const routes = [
  {
    method: 'GET',
    path: '/{param*}',
    options: {
      auth: false
    },
    handler: getLandingPageHandler(),
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        })
      }
    },
    handler: postLoginHandler
  },
  {
    method: 'POST',
    path: '/refreshToken',
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          refreshToken: Joi.string().required()
        })
      }
    },
    handler: postRefreshTokenHandler
  },
  {
    method: 'GET',
    path: '/profile',
    options: {
      auth: 'jwt'
    },
    handler: getProfileHandler
  }
];

module.exports = routes;
