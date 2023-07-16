const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Message = require('../models/messageSchema');
const User = require('../models/userSchema');
const { authenticate,authenticateUser, isAdmin } = require('../middleware/auth');
const fs = require('fs');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const modifiedName = originalName.replace(/\s/g, '_').replace(extension, '');
    const uniqueName = `${modifiedName}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
// Create a new message with file upload support
// Create a new message with file upload support
router.post('/compose', authenticateUser, upload.array('attachments'), async (req, res) => {
  const { receivers, subject, body } = req.body;
  const senderUsername = req.user.username; // Get the username of the sender

  try {
    // Convert receivers to an array
    const receiverArray = Array.isArray(receivers) ? receivers : receivers.split(",").map(receiver => receiver.trim());

    // Find the receiver users by their usernames
    const receiverUsers = await User.find({ username: { $in: receiverArray } });
    if (receiverUsers.length !== receiverArray.length) {
      return res.status(400).json({ error: 'Invalid receiver(s)' });
    }
    const receiverUsernames = receiverUsers.map(user => user.username);

    // Process attachments
    const attachments = req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      downloadLink: `/api/messages/attachments/${path.basename(file.path)}`
    }));

    // Create a new message
    const newMessage = new Message({
      receivers: receiverUsernames, // Store receiver usernames
      sender: senderUsername, // Use the username of the sender
      subject,
      body,
      attachments
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    res.json({ message: 'Message created successfully', message: savedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create message' });
  }
});



// Get all messages
router.get('/allMessages',authenticateUser, isAdmin, async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Download attachment
router.get('/attachments/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);
  res.download(filePath, filename);
});

// Get user's inbox
router.get('/inbox', authenticateUser, async (req, res) => {
    try {
      const username = req.user.username; // Get the username of the authorized user
  
      // Find messages where the authorized user is in the receiver array
      const inboxMessages = await Message.find({ receivers: username });
  
      res.json(inboxMessages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve inbox' });
    }
  });
  
// Get user's outbox
router.get('/outbox', authenticateUser, async (req, res) => {
    try {
      const username = req.user.username; // Get the username of the authorized user
  
      // Find messages where the authorized user is the sender
      const outboxMessages = await Message.find({ sender: username });
  
      res.json(outboxMessages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve outbox' });
    }
  });

//   // Delete a message
// router.delete('/delete/:id', authenticateUser, isAdmin, async (req, res) => {
//   const _id = req.params.id;
//   console.log(_id);
//       try {
//       const result = await Message.deleteOne({ _id });
      
//       if (result.deletedCount === 0) {
//         return res.status(404).json({ error: 'Message not found' });
//       }

//       res.json({ message: 'Message deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to delete message' });
//   }
// });

// Delete a message and its attached files
// Delete a message and its attached files
router.delete('/delete/:id', authenticateUser, isAdmin, async (req, res) => {
  const messageId = req.params.id;

  try {
    // Find the message by ID
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Delete the attached files
    message.attachments.forEach(attachment => {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(attachment.path));

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Delete the file
        fs.unlinkSync(filePath);
      }
    });

    // Delete the message
    const result = await Message.deleteOne({ _id: messageId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message and attached files deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});



// Authorization middleware to check if the user is an admin
const authorizeAdmin = (req, res, next) => {
  // Assuming you have a way to determine if the authenticated user is an admin
  if (req.user.isAdmin) {
    next(); // User is authorized, proceed to the next middleware or route handler
  } else {
    res.status(403).json({ error: 'Unauthorized access' }); // User is not authorized
  }
};

  
module.exports = router;
