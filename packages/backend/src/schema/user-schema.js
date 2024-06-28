const mongoose = require('mongoose');
const qmathSchema = require('./qmath-schema');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: 'Username "{VALUE}" already exists',
    required: true,
  },
  email: {
    type: String,
    unique: 'Email "{VALUE}" already exists',
    required: true,
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
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

module.exports = userSchema;
