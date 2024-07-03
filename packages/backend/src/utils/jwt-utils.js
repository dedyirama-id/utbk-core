const Jwt = require('@hapi/jwt');

const generateAccessToken = (payload) => Jwt.token.generate(payload, {
  key: process.env.ACCESS_TOKEN_SECRET_KEY,
  algorithm: 'HS256',
  ttlSec: 60 * 15, // 15 seconds
});

const generateRefreshToken = (payload) => Jwt.token.generate(payload, {
  key: process.env.REFRESH_TOKEN_SECRET_KEY,
  algorithm: 'HS256',
  ttlSec: 60 * 60 * 24 * 30, // 30 days
});

const verifyToken = (artifact, secret, options = {}) => {
  try {
    Jwt.token.verify(artifact, secret, options);
    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      error: err.message,
    };
  }
};

const generateJwtPayloadObject = (user) => ({
  id: user.id,
  username: user.username,
});

module.exports = {
  generateAccessToken, generateRefreshToken, verifyToken, generateJwtPayloadObject,
};
