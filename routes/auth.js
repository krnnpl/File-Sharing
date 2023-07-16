
const session = require('express-session');
const cookieParser = require('cookie-parser');


const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const { authenticate, authenticateUser, isAdmin } = require('../middleware/auth');
require('dotenv').config();

// Define the secret key for signing the access token
const secretKey = process.env.SECRET_KEY; // Replace with your actual secret key


// Register a new user (accessible only to authorized admin users)
router.post('/register', authenticateUser, isAdmin, async (req, res) => {
  // Get the user information from the request body
  const { firstName,lastName,phoneNumber, username, password, branch } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ firstName,lastName,phoneNumber,username, password, branch, isAdmin: false });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});




// User login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Compare the entered password with the stored hash
    const isMatch = await user.comparePassword(password);

    // Check if the password matches
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate access token
    const accessToken = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    // Retrieve the user's profile information
    const userProfile = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      // Add any other profile fields you want to display
    };

    
    // Store the access token in the session or a cookie
    req.session.accessToken = accessToken;
    req.session.userProfile = userProfile;
    // Set the access token as an HTTP-only cookie
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('userProfile', userProfile, { httpOnly: true });
    // User authenticated successfully
    res.json({ message: 'User authenticated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Admin login
// router.post('/admin/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Find the admin user by username
//     const admin = await User.findOne({ username, isAdmin: true });

//     // Check if the admin user exists
//     if (!admin) {
//       return res.status(401).json({ error: 'Admin user not found' });
//     }

//     // Compare the entered password with the stored hash
//     const isMatch = await admin.comparePassword(password);

//     // Check if the password matches
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid password for admin' });
//     }

//     // Generate access token
//     const accessToken = jwt.sign({ userId: admin._id }, secretKey, { expiresIn: '1h' });

//     // Admin authenticated successfully
//     res.json({ message: 'Admin authenticated successfully', accessToken });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to authenticate admin' });
//   }
// });
// Admin login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin user by username
    const admin = await User.findOne({ username, isAdmin: true });

    // Check if the admin user exists
    if (!admin) {
      return res.status(401).json({ error: 'Admin user not found' });
    }

    // Compare the entered password with the stored hash
    const isMatch = await admin.comparePassword(password);

    // Check if the password matches
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password for admin' });
    }

    // Generate access token
    const accessToken = jwt.sign({ userId: admin._id }, secretKey, { expiresIn: '1h' });

    // Store the access token in the session or a cookie
    req.session.accessToken = accessToken;
    // Set the access token as an HTTP-only cookie
    res.cookie('accessToken', accessToken, { httpOnly: true });

    // Admin authenticated successfully
    res.json({ message: 'Admin authenticated successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to authenticate admin' });
  }
});



// Delete a user by username (admin only)
router.delete('/users/:username', authenticateUser, isAdmin, async (req, res) => {
  const { username } = req.params;

  try {
    // Delete the user
    const result = await User.deleteOne({ username });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Reset user password (accessible only to authorized admin users)
router.post('/reset-password', authenticateUser, isAdmin, async (req, res) => {
  const { username } = req.body;
  const { newPassword } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get all users (accessible only to authorized admin)
router.get('/users', authenticateUser, isAdmin, async (req, res) => {
  try {
    // Retrieve all users from the database
    const users = await User.find({}, '-isAdmin -password -_id -__v');

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
