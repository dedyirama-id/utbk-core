const Jwt = require('@hapi/jwt');

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

module.exports = verifyToken;
