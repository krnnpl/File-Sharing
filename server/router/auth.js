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
    const { name, email, phone, password, cpassword } = req.body;
    if (!name || !email || !phone || !password || !cpassword) {
        return res.status(422).json({ error: "Fill the filed" });
    }
    try {
        const userExist = await User.findOne({ email: email })

        if (userExist) {
            return res.status(422).json({ error: "Email already Exist" });
        }else if(password != cpassword){
            return res.status(422).json({ error: "Password is not Matching" });


        }else{
            const user = new User({ name, email, phone, password, cpassword });

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
        const {email, password}=req.body;
        if(!email || !password) {
            return res.status(400).json({error:"Fill the data in all Field"})
        }

        const userLogin= await User.findOne({email:email});
        
        //console.log(userLogin);
        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password);

            const token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken", token,{
                expires:new Date(Date.now() + 3600000 ),
                httpOnly:true
            });

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
