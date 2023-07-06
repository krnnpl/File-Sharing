const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
require('dotenv').config();
const secret_key = process.env.SECRET_KEY;

// Middleware function to authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Check if the request contains the Authorization header
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract the token from the Authorization header
    const token = authorizationHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, secret_key); // Replace 'your_secret_key' with your actual secret key

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach the user object to the request for further use
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Middleware function to check if user is admin
// const isAdmin = (req, res, next) => {
  
//   if (!isAdmin) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   next();
// };

// isAdmin middleware function
const isAdmin = (req, res, next) => {
  // Check if the user is authenticated and is an admin
  if (req.user && req.user.isAdmin) {
    next(); // User is an admin, proceed to the next middleware/route handler
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // User is not an admin, return an unauthorized error
  }
};

module.exports = isAdmin;

module.exports = { authenticate, isAdmin};
