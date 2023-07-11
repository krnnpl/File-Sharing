const jwt= require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt= require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  branch: {
    type: String,
    required: true
  }
});
 


//hashing the password

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password= await bcrypt.hash(this.password, 12);
        this.confirmPassword=await bcrypt.hash(this.password, 12);

    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



const User = mongoose.model('USER', userSchema);

module.exports = User;