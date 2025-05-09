const express = require('express');
const { 
  getVoteOptions, 
  submitVote, 
  getVoteResults, 
  getUserVote 
} = require('../controllers/voteController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/options', getVoteOptions);
router.get('/results', protect, admin, getVoteResults);
router.get('/me', protect, getUserVote);
router.post('/', protect, submitVote);

module.exports = router;