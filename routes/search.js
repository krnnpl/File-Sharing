const express = require('express');
const router = express.Router();
const { authenticate, authenticateUser } = require('../middleware/auth');
const Message = require('../models/messageSchema');
const User = require('../models/userSchema');

router.get('/', authenticateUser, async (req, res) => {
  try {
    const { query } = req.query;
    const authorizedUsername = req.user.username;
    const isAdmin = req.user.isAdmin;

    let inboxSearchQuery;
    let outboxSearchQuery;

    const searchRegex = new RegExp(query, 'i');

    if (isAdmin) {
      // If the user is an admin, search all messages
      inboxSearchQuery = {
        $or: [
          { subject: searchRegex },
          { body: searchRegex },
          { sender: searchRegex },
          { receivers: searchRegex },
          { 'attachments.filename': searchRegex }
        ]
      };
      outboxSearchQuery = inboxSearchQuery;
    } else {
      // Search in the authorized user's inbox and outbox
      inboxSearchQuery = {
        $and: [
          { $or: [{ sender: authorizedUsername }, { receivers: authorizedUsername }] },
          {
            $or: [
              { subject: searchRegex },
              { body: searchRegex },
              { sender: searchRegex },
              { receivers: searchRegex },
              { 'attachments.filename': searchRegex }
            ]
          }
        ]
      };
      outboxSearchQuery = {
        $and: [
          { sender: authorizedUsername },
          {
            $or: [
              { subject: searchRegex },
              { body: searchRegex },
              { sender: searchRegex },
              { receivers: searchRegex },
              { 'attachments.filename': searchRegex }
            ]
          }
        ]
      };
    }

    // Search messages based on the search query
    const inboxSearch = await Message.find(inboxSearchQuery);
    const outboxSearch = await Message.find(outboxSearchQuery);

    // Search users by username, branch name, first name, and last name
    const users = await User.find(
      {
        $or: [
          { username: searchRegex },
          { branch: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      },
      { username: 1, branch: 1, firstName: 1, lastName: 1 }
    );

    res.json({ inboxSearch, outboxSearch, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});


module.exports = router;
