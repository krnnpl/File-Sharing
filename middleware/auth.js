const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

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
    const decoded = jwt.verify(token, secretKey); // Replace 'your_secret_key' with your actual secret key

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

// Middleware function to authenticate the user based on the access token in the session or cookie
const authenticateUser = (req, res, next) => {
  try {
    const accessToken = req.session.accessToken || req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(accessToken, secretKey);

    // User.findById(decoded.userId, (err, user) => {
    //   if (err || !user) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    //   }
     User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

      req.user = user;
      next();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// isAdmin middleware function
const isAdmin = (req, res, next) => {
  // Check if the user is authenticated and is an admin
  if (req.user && req.user.isAdmin) {
    next(); // User is an admin, proceed to the next middleware/route handler
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // User is not an admin, return an unauthorized error
  }
};
// Middleware function to authenticate specific routes and redirect unauthorized users to the login page
const authenticateForURL = (req, res, next) => {
  try {
    const accessToken = req.session.accessToken || req.cookies.accessToken;

    if (!accessToken) {
      return res.redirect('/');
    }

    const decoded = jwt.verify(accessToken, secretKey);

    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.redirect('/');
        }

        req.user = user;
        next();
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Middleware function to authenticate specific routes and redirect unauthorized users to the login page
const authenticateForAdminURL = (req, res, next) => {
  try {
    const accessToken = req.session.accessToken || req.cookies.accessToken;

    if (!accessToken) {
      return res.redirect('/admin');
    }

    const decoded = jwt.verify(accessToken, secretKey);

    User.findById(decoded.userId)
      .then((user) => {
        if (!user.isAdmin) {
          return res.redirect('/admin');
        }

        req.user = user;
        next();
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { authenticate, authenticateForURL,authenticateForAdminURL, authenticateUser, isAdmin };
