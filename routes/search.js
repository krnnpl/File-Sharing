const express = require('express');
const router = express.Router();
const { authenticate, authenticateUser } = require('../middleware/auth');
const Message = require('../models/messageSchema');
const User = require('../models/userSchema');

// Perform search in authorized user's inbox and outbox
// router.get('/', authenticateUser, async (req, res) => {
//   try {
//     const { query } = req.query;
//     const authorizedUsername = req.user.username;

//     // Search in the authorized user's inbox and outbox
//     const messages = await Message.find({
//       $or: [
//         { sender: authorizedUsername, subject: { $regex: query, $options: 'i' } },
//         { receivers: authorizedUsername, subject: { $regex: query, $options: 'i' } }
//       ]
//     });

//     // Search users by username and branch name
//     const users = await User.find(
//       {
//         $or: [
//           { username: { $regex: query, $options: 'i' } },
//           { branch: { $regex: query, $options: 'i' } }
//         ]
//       },
//       { username: 1, branch: 1 }
//     );

//     res.json({ messages, users });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to perform search' });
//   }
// });

// Perform search in authorized user's inbox and outbox
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { query } = req.query;
    const authorizedUsername = req.user.username;
    const isAdmin = req.user.isAdmin;

    let searchQuery;

    if (isAdmin) {
      // If the user is an admin, search all messages
      searchQuery = {
        subject: { $regex: query, $options: 'i' }
      };
    } else {
      // Search in the authorized user's inbox and outbox
      searchQuery = {
        $or: [
          { sender: authorizedUsername, subject: { $regex: query, $options: 'i' } },
          { receivers: authorizedUsername, subject: { $regex: query, $options: 'i' } }
        ]
      };
    }

    // Search messages based on the search query
    const messages = await Message.find(searchQuery);

    // Search users by username, branch name, first name, and last name
    const users = await User.find(
      {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { branch: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ]
      },
      { username: 1, branch: 1, firstName: 1, lastName: 1 }
    );

    res.json({ messages, users });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

module.exports = router;
