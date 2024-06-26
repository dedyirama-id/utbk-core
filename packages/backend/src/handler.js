const path = require('path');
const Jwt = require('@hapi/jwt');
const users = require('./users');
// const { v4: uuidv4 } = require('uuid');
const refreshTokens = require('./jwt-tokens');

const getLandingPageHandler = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      proxy: {
        host: 'localhost',
        port: 9001,
        protocol: 'http',
        passThrough: true,
      },
    };
  }
  return {
    directory: {
      path: path.join(__dirname, '../../frontend/landing-page/dist/'),
      redirectToSlash: true,
      index: true,
      // listing: true
    },
  };
};

const postLoginHandler = async (request, h) => {
  const { username, password } = request.payload;
  const user = users[username];

  if (!user || user.password !== password) return h.response({ message: 'Invalid username or password' }).code(401);

  const payload = {
    id: user.id,
    username: user.username,
  };

  const accessToken = Jwt.token.generate(payload, {
    key: process.env.ACCESS_TOKEN_KEY,
    algorithm: 'HS256',
    ttlSec: 15,
  });

  const refreshToken = Jwt.token.generate(payload, {
    key: process.env.REFRESH_TOKEN_KEY,
    algorithm: 'HS256',
    ttlSec: 60 * 60 * 24 * 30,
  });

  refreshTokens[refreshToken] = user.username;
  return { accessToken, refreshToken };
};

const postRefreshTokenHandler = async (request, h) => {
  const { refreshToken } = request.payload;
  const username = refreshTokens[refreshToken];

  if (!username) return h.response({ message: 'Invalid refresh token' }).code(401);

  const user = users[username];
  const payload = {
    id: user.id,
    username: user.username,
  };

  const newAccessToken = Jwt.token.generate(
    payload,
    {
      key: process.env.ACCESS_TOKEN_KEY,
      algorithm: 'HS256',
      ttlSec: 15,
    },
  );

  return { accessToken: newAccessToken };
};

const getProfileHandler = (request, h) => {
  if (!request.auth || !request.auth.credentials || !request.auth.credentials.user) {
    return h.response({ message: 'Unauthorized' }).code(401);
  }

  return { user: request.auth.credentials.user };
};

module.exports = {
  getLandingPageHandler,
  postLoginHandler,
  postRefreshTokenHandler,
  getProfileHandler,
};
