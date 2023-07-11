const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../model/messageSchema');
const User = require('../model/userSchema');

// Perform search in authorized user's inbox and outbox
router.get('/', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    const authorizedUsername = req.user.username;

    // Search in the authorized user's inbox and outbox
    const messages = await Message.find({
      $or: [
        { sender: authorizedUsername, subject: { $regex: query, $options: 'i' } },
        { receivers: authorizedUsername, subject: { $regex: query, $options: 'i' } }
      ]
    });

    // Search users by username and branch name
    const users = await User.find(
      {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
          { branch: { $regex: query, $options: 'i' } }
        ]
      },
      { username: 1,firstName, lastName, phoneNumber, branch: 1 }
    );

    res.json({ messages, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

module.exports = router;
