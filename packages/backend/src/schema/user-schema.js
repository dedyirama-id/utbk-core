const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const qmathSchema = require('./qmath-schema');
const hashPassword = require('../middleware/hash-password');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: 'Username "{VALUE}" already exists',
    required: true,
    minlength: 3,
    validate: [
      (v) => validator.isAlphanumeric(v.replace(/[_-]/g, '')),
      'Username must only contain letters, numbers, underscore (_) or dash (-).',
    ],
  },
  email: {
    type: String,
    unique: 'Email "{VALUE}" already exists',
    required: true,
    validate: [
      (v) => validator.isEmail(v),
      'Invalid email format',
    ],
  },
  phone: {
    type: String,
    validate: [
      (v) => validator.isMobilePhone(v, 'id-ID'),
      'Invalid phone number format',
    ],
  },
  password: {
    type: String,
    required: true,
    validate: [
      (v) => validator.isStrongPassword(v, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      }),
      'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
    ],
  },
  role: {
    type: String,
    default: 'user',
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  lastLoggedIn: {
    type: Date,
    default: Date.now,
  },
  qmath: {
    type: qmathSchema,
    default: () => ({}),
  },
});

userSchema.methods.validatePassword = async function (password) {
  const status = await bcrypt.compare(password, this.password);
  return status;
};

userSchema.pre('save', hashPassword);
module.exports = userSchema;
