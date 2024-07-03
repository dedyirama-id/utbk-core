const {
  postLoginHandler, getProfileHandler, postRefreshTokenHandler,
  postRegisterHandler, deleteAccountHandler,
} = require('../handler/user-db-handler');
const { loginSchema } = require('../schema/auth-schema');

const apiRoutes = [
  {
    method: 'POST',
    path: '/api/register',
    options: {
      auth: false,
    },
    handler: postRegisterHandler,
  },
  {
    method: 'POST',
    path: '/api/login',
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
    path: '/api/refresh-token',
    options: {
      auth: false,
    },
    handler: postRefreshTokenHandler,
  },
  {
    method: 'GET',
    path: '/api/profile',
    options: {
      auth: 'jwt',
    },
    handler: getProfileHandler,
  },
  {
    method: 'DELETE',
    path: '/api/account',
    options: {
      auth: 'jwt',
    },
    handler: deleteAccountHandler,
  },
];

module.exports = apiRoutes;
