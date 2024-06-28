const path = require('path');
const Jwt = require('@hapi/jwt');
const User = require('../model/user');
// const { v4: uuidv4 } = require('uuid');
const refreshTokens = require('../data/jwt-tokens');

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

const postRegisterHandler = async (request, h) => {
  const { username, email, password } = request.payload;
  if (!username || !email || !password) return h.response({ message: 'All fields are required' }).code(400);

  const errors = [];
  if (await User.findOne({ email })) errors.push({ path: 'email', message: 'Email already exists' });
  if (await User.findOne({ username })) errors.push({ path: 'username', message: 'Username already exists' });
  if (errors.length) return h.response({ success: false, errors }).code(409);

  const newUser = await User.create({
    username,
    email,
    password,
  }).catch((error) => {
    if (error.code === 11000) return h.response({ success: false, message: 'Email already exists' }).code(409);
    if (error.name === 'ValidationError') return h.response({ success: false, message: error.message }).code(400);
    console.log(error);
    return h.response({ success: false, message: 'Something went wrong' }).code(500);
  });

  return { success: true, message: 'User created successfully', user: newUser };
};

const postLoginHandler = async (request, h) => {
  const { email, password } = request.payload;
  const user = await User.findOne({ email });

  if (!user || user.password !== password) return h.response({ message: 'Invalid username or password' }).code(401);

  const payload = {
    id: user.id,
    username: user.username,
  };

  const accessToken = Jwt.token.generate(payload, {
    key: process.env.ACCESS_TOKEN_SECRET_KEY,
    algorithm: 'HS256',
    ttlSec: 15,
  });

  const refreshToken = Jwt.token.generate(payload, {
    key: process.env.REFRESH_TOKEN_SECRET_KEY,
    algorithm: 'HS256',
    ttlSec: 60 * 60 * 24 * 30,
  });

  refreshTokens[refreshToken] = user.email;
  return { accessToken, refreshToken };
};

const postRefreshTokenHandler = async (request, h) => {
  const { refreshToken } = request.payload;
  const email = refreshTokens[refreshToken];

  if (!email) return h.response({ message: 'Invalid refresh token' }).code(401);

  const user = await User.findOne({ email });
  const payload = {
    id: user.id,
    username: user.username,
  };

  const newAccessToken = Jwt.token.generate(
    payload,
    {
      key: process.env.ACCESS_TOKEN_SECRET_KEY,
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
  postRegisterHandler,
  postLoginHandler,
  postRefreshTokenHandler,
  getProfileHandler,
};
