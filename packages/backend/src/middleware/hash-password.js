const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  }

  return next();
}

module.exports = hashPassword;
