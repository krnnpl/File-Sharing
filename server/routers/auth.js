const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt= require('bcryptjs');
require('../db/conn');
const User = require("../model/userSchema");



router.post('/register', authenticate, isAdmin, async (req, res) => {
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

router.post('/signin',async(req,res)=>{
    try {
        const {username, password}=req.body;
        if(!username || !password) {
            return res.status(400).json({error:"Fill in all Field"})
        }

        const userLogin= await User.findOne({username:username});
        
        //console.log(userLogin);
        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password);

            
          

        if(!isMatch) {
            res.status(400).json({error: "Invalid Credientials"});
        } else{
        res.json({message:"User Sign in successfully"});
        }
    }else{
        res.status(400).json({error: "Invalid Credientials"});
    }
    } catch (err) {
        console.log(err);
        
    }
    
}) 
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
      const accessToken = jwt.sign({ userId: admin._id }, secretKey, { expiresIn: '1h' });
  
      // Admin authenticated successfully
      res.json({ message: 'Admin authenticated successfully', accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to authenticate admin' });
    }
  });

module.exports = router;
