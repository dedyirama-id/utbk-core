const mongoose = require('mongoose');
const qmathHistorySchema = require('./qmath-history-schema');

const qmathSchema = new mongoose.Schema({
  histories: {
    type: [qmathHistorySchema],
    default: [],
  },
  lastLoggedIn: {
    type: Date,
    default: Date.now,
  },
  rank: {
    type: Number,
  },
}, { _id: false });

module.exports = qmathSchema;
