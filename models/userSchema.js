const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
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

// Hash password before saving
userSchema.pre('save', function(next) {
  const user = this;

  // Generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // Hash the password with the generated salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // Replace the plain password with the hash
      user.password = hash;
      next();
    });
  });
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  

module.exports = mongoose.model('User', userSchema);
