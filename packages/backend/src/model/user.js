// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: 'Two users cannot share the same username ({VALUE})',
    required: true,
  },
  email: {
    type: String,
    unique: 'Two users cannot share the same email ({VALUE})',
    required: [true, 'Email is required!!!!'],
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
});

userSchema.plugin(require('mongoose-beautiful-unique-validation'));

const User = mongoose.model('User', userSchema);
module.exports = User;
