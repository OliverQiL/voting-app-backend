const { Vote, VoteOption } = require('../models/voteModel');

// @desc    Get all vote options with counts
// @route   GET /api/votes/options
// @access  Public
exports.getVoteOptions = async (req, res) => {
  try {
    const options = await VoteOption.find({});
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a vote
// @route   POST /api/votes
// @access  Private
exports.submitVote = async (req, res) => {
  const { option } = req.body;

  try {
    // Check if user has already voted
    const existingVote = await Vote.findOne({ user: req.user._id });

    if (existingVote) {
      // Update existing vote
      const oldOption = existingVote.option;
      existingVote.option = option;
      await existingVote.save();

      // Decrement old option count
      await VoteOption.findOneAndUpdate(
        { name: oldOption },
        { $inc: { count: -1 } }
      );

      // Check if option exists, if not create it
      let voteOption = await VoteOption.findOne({ name: option });
      if (!voteOption) {
        voteOption = await VoteOption.create({ name: option });
      }

      // Increment new option count
      await VoteOption.findOneAndUpdate(
        { name: option },
        { $inc: { count: 1 } }
      );

      res.json({ message: 'Vote updated successfully' });
    } else {
      // Create new vote
      await Vote.create({
        user: req.user._id,
        option,
      });

      // Check if option exists, if not create it
      let voteOption = await VoteOption.findOne({ name: option });
      if (!voteOption) {
        voteOption = await VoteOption.create({ name: option, count: 1 });
      } else {
        // Increment option count
        await VoteOption.findOneAndUpdate(
          { name: option },
          { $inc: { count: 1 } }
        );
      }

      res.status(201).json({ message: 'Vote submitted successfully' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get voting results
// @route   GET /api/votes/results
// @access  Private/Admin
exports.getVoteResults = async (req, res) => {
  try {
    const results = await VoteOption.find({}).sort({ count: -1 });
    const totalVotes = await Vote.countDocuments();
    
    res.json({
      totalVotes,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's current vote
// @route   GET /api/votes/me
// @access  Private
exports.getUserVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({ user: req.user._id });
    
    if (vote) {
      res.json({ option: vote.option });
    } else {
      res.json({ option: null });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};