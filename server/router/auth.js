const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt= require('bcryptjs');
require('../db/conn');
const User = require("../model/userSchema");

router.get('/', (req, res) => {
    res.send('Hello world from server router js')
});

router.post('/register', async (req, res) => {
    const { username, branch, password, cpassword,isAdmin } = req.body;
    if (!username || !branch   || !password || !cpassword || !isAdmin) {
        return res.status(422).json({ error: "Fill the filed" });
    }
    try {
        const userExist = await User.findOne({ username: username })

        if (userExist) {
            return res.status(422).json({ error: "User already Exist" });
        }else if(password != cpassword){
            return res.status(422).json({ error: "Password is not Matching" });


        }else{
            const user = new User({ username, branch, password, cpassword,isAdmin });

        const userRegister = await user.save()
        if (userRegister) {
            res.status(201).json({ message: "User registered successfully" });

        }
        

        }

        


    } catch (err) {
        console.log(err);
    }




    //console.log(req.body.name);
    // console.log(req.body.email);
    //res.json({ message: req.body });
});

router.post('/signin',async(req,res)=>{
    try {
        const {username, password}=req.body;
        if(!username || !password) {
            return res.status(400).json({error:"Fill the data in all Field"})
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

module.exports = router;
