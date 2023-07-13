const jwt = require('jsonwebtoken');
const session= require('express-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const router = express.Router();
const bcrypt= require('bcryptjs');
require('../db/conn');
require('dotenv').config();
const User = require("../model/userSchema");
const { authenticate, authenticateUser, isAdmin } = require('../middleware/auth');
const secretKey = process.env.SECRET_KEY;



router.post('/register', authenticateUser, isAdmin, async (req, res) => {
    const { firstName,lastName,phoneNumber, username, password,confirmPassword, branch } = req.body;
    if (!firstName ||!lastName ||!phoneNumber|| !username  || !password || !confirmPassword || !branch) {
        return res.status(422).json({ error: "Fill the filed" });
    }
    try {
        const userExist = await User.findOne({ username: username })

        if (userExist) {
            return res.status(422).json({ error: "User already Exist" });
        }else if(password != confirmPassword){
            return res.status(422).json({ error: "Password is not Matching" });


        }else{
            const user = new User({ firstName,lastName,phoneNumber, username, password,confirmPassword, branch});

        const userRegister = await user.save()
        if (userRegister) {
            res.status(201).json({ message: "User registered successfully" });

        }
        

        }

        


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to register user' });
    }




    
});

// User login
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(400).json({error:"Fill in all Field"})
    }

  
    try {
      // Find the user by username
      const user = await User.findOne({ username:username });
  
      // Check if the user exists
      
  
      // Compare the entered password with the stored hash
      const isMatch = await user.comparePassword(password);

  
      // Check if the password matches
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid  Credientias' });
      }
  
      // Generate access token
      const accessToken = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
  
      // User authenticated successfully
      res.json({ message: 'User authenticated successfully', accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to authenticate user' });
    }
  });




// Admin login
router.post('/admin', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find the admin user by username
      const admin = await User.findOne({ username, isAdmin: true });
  
      // Check if the admin user exists
      if (!admin) {
        return res.status(401).json({ error: 'Invalid admin' });
      }
  
      // Compare the entered password with the stored hash
      const isMatch = await admin.comparePassword(password);
  
      // Check if the password matches
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid login Credientials' });
      }
  
      // Generate access token
      const accessToken = jwt.sign({ userId: admin._id }, secretKey, { expiresIn: '2h' });
      req.session.accessToken=accessToken;

      res.cookie('accessToken', accessToken, { httpOnly: true});

  
      // Admin authenticated successfully
      res.json({ message: 'Admin authenticated successfully', accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to authenticate admin' });
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
//delete user
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
router.post('/reset-password/:username', authenticateUser, isAdmin, async (req, res) => {
  const { username } = req.params;
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
  

module.exports = router;
