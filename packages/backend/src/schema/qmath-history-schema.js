const { default: mongoose } = require('mongoose');

const qmathHistorySchema = mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
  },
});

module.exports = qmathHistorySchema;
