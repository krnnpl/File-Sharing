// const express = require('express');
// const router = express.Router();
// const Message = require('../models/messageSchema');
// const User = require('../models/userSchema');

// router.get('/', async (req, res) => {
//     const { query } = req.query; // Get the search query from the request query parameters
  
//     try {
//       // Perform the search query on your Message and User models
//       const messageResults = await Message.find({
//         $or: [
//           { subject: { $regex: query, $options: 'i' } }, // Perform a case-insensitive regex search on the subject
//           { body: { $regex: query, $options: 'i' } } // Perform a case-insensitive regex search on the body
//         ]
//       });
  
//       const userResults = await User.find({
//         $or: [
//         {username: { $regex: query, $options: 'i' }}, // Perform a case-insensitive regex search on the username
//         {branch: { $regex: query, $options: 'i' }}
//         ]
//       });
  
//       // Combine and return the search results
//       const results = {
//         messages: messageResults,
//         users: userResults
//       };
  
//       res.json(results);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Failed to perform search' });
//     }
//   });
//   module.exports = router;
  


const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/messageSchema');
const User = require('../models/userSchema');

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
          { branch: { $regex: query, $options: 'i' } }
        ]
      },
      { username: 1, branch: 1 }
    );

    res.json({ messages, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

module.exports = router;
