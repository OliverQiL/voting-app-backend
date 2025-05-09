const mongoose = require('mongoose');

const voteOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  option: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const VoteOption = mongoose.model('VoteOption', voteOptionSchema);
const Vote = mongoose.model('Vote', voteSchema);

module.exports = { Vote, VoteOption };
