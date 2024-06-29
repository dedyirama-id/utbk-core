const Jwt = require('@hapi/jwt');
const cookie = require('cookie');
const User = require('../model/user');
const formatMongooseError = require('../utils/format-mongoose-error');
const verifyToken = require('../utils/verify-token');

const postRegisterHandler = async (request, h) => {
  const { username, email, password } = request.payload;
  if (!username || !email || !password) return h.response({ message: 'All fields are required' }).code(400);

  const errors = [];
  if (await User.findOne({ email })) errors.push({ path: 'email', message: 'Email already exists' });
  if (await User.findOne({ username })) errors.push({ path: 'username', message: 'Username already exists' });
  if (errors.length) return h.response({ success: false, errors }).code(409);

  try {
    const newUser = await User.create({
      username,
      email,
      password,
    });

    return h.response({ success: true, message: 'User created successfully', user: newUser }).code(201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const formattedError = formatMongooseError(error);
      return h.response({ success: false, errors: formattedError }).code(400);
    }
    return h.response({ success: false, message: 'Something went wrong' }).code(500);
  }
};

const postLoginHandler = async (request, h) => {
  const { email, password } = request.payload;
  const user = await User.findOne({ email });

  if (!user || !(await user.validatePassword(password))) return h.response({ message: 'Invalid username or password' }).code(401);

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

  return h.response({ accessToken }).header('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }));
};

const deleteAccountHandler = async (request, h) => {
  const { password } = request.payload;
  const { id } = request.auth.credentials.user;

  const user = await User.findById(id);
  if (!user) return h.response({ success: false, message: 'You must login first!' }).code(404);
  if (user.password !== password) return h.response({ success: false, message: 'Invalid password' }).code(401);

  await User.findByIdAndDelete(id);
  return { success: true, message: 'Goodbye! We will miss you' };
};

const postRefreshTokenHandler = async (request, h) => {
  const { refreshToken } = request.state;

  if (!refreshToken) {
    return h.response({ message: 'No refresh token provided' }).code(401);
  }

  try {
    const decodedToken = Jwt.token.decode(refreshToken);
    const verifyResponse = verifyToken(decodedToken, process.env.REFRESH_TOKEN_SECRET_KEY);

    const { payload } = decodedToken.decoded;

    if (!verifyResponse.isValid) return h.response({ error: verifyResponse.error }).code(401);

    const user = await User.findById(payload.id);
    if (!user) return h.response({ message: 'User not found' }).code(404);

    const newAccessToken = Jwt.token.generate(
      { id: user.id, username: user.username },
      {
        key: process.env.ACCESS_TOKEN_SECRET_KEY,
        algorithm: 'HS256',
        ttlSec: 15 * 60, // 15 menit
      },
    );

    const newRefreshToken = Jwt.token.generate(
      { id: user.id, username: user.username },
      {
        key: process.env.REFRESH_TOKEN_SECRET_KEY,
        algorithm: 'HS256',
        ttlSec: 60 * 60 * 24 * 30, // 30 hari
      },
    );

    return h.response({ accessToken: newAccessToken }).state('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } catch (error) {
    return h.response({ message: 'Something went wrong' }).code(500);
  }
};

const getProfileHandler = (request, h) => {
  if (!request.auth || !request.auth.credentials || !request.auth.credentials.user) {
    return h.response({ message: 'Unauthorized' }).code(401);
  }

  return { user: request.auth.credentials.user };
};

module.exports = {
  postRegisterHandler,
  postLoginHandler,
  postRefreshTokenHandler,
  deleteAccountHandler,
  getProfileHandler,
};
