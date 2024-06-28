const {
  postLoginHandler, getProfileHandler, postRefreshTokenHandler,
  postRegisterHandler, deleteAccountHandler,
} = require('../handler/db-handler');
const { getLandingPageHandler } = require('../handler/static-handler');
const { loginSchema, refreshSchema } = require('../schema/auth-schema');

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
    path: '/register',
    options: {
      auth: false,
    },
    handler: postRegisterHandler,
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
  {
    method: 'DELETE',
    path: '/account',
    options: {
      auth: 'jwt',
    },
    handler: deleteAccountHandler,
  },
];

module.exports = routes;
