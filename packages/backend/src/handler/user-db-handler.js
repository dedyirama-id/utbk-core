const Jwt = require('@hapi/jwt');
const cookie = require('cookie');
const User = require('../model/user');
const formatMongooseError = require('../utils/format-mongoose-error');
const {
  generateAccessToken, generateRefreshToken, verifyToken, generateJwtPayloadObject,
} = require('../utils/jwt-utils');

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

    const userToResponse = newUser.toObject();
    delete userToResponse.password;
    return h.response({ success: true, message: 'User created successfully', user: userToResponse }).code(201);
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

  const payload = generateJwtPayloadObject(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const userToResponse = user.toObject();

  delete userToResponse.password;

  return h.response({ accessToken, user: userToResponse }).header('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
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
  if (await user.validatePassword(password) === false) return h.response({ success: false, message: 'Invalid password' }).code(401);

  await User.findByIdAndDelete(id);
  return { success: true, message: 'Goodbye! We will miss you' };
};

const postRefreshTokenHandler = async (request, h) => {
  const { refreshToken } = request.state;

  if (!refreshToken) return h.response({ message: 'No refresh token provided' }).code(401);

  try {
    const decodedToken = Jwt.token.decode(refreshToken);
    const verifyResponse = verifyToken(decodedToken, process.env.REFRESH_TOKEN_SECRET_KEY);

    const { payload } = decodedToken.decoded;

    if (!verifyResponse.isValid) return h.response({ error: verifyResponse.error }).code(401);

    const user = await User.findById(payload.id);
    if (!user) return h.response({ message: 'User not found' }).code(404);

    const newPayload = generateJwtPayloadObject(user);
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    return h.response({ accessToken: newAccessToken }).state('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } catch (error) {
    return h.response({ message: 'Something went wrong' }).code(500);
  }
};

const getProfileHandler = async (request, h) => {
  if (!request.auth || !request.auth.credentials || !request.auth.credentials.user) return h.response({ message: 'Unauthorized' }).code(401);
  const user = await User.findById(request.auth.credentials.user.id);
  const userToResponse = user.toObject();

  delete userToResponse.password;
  return userToResponse;
};

module.exports = {
  postRegisterHandler,
  postLoginHandler,
  postRefreshTokenHandler,
  deleteAccountHandler,
  getProfileHandler,
};
