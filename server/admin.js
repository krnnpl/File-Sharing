const express = require('express');
const router = express.Router();
const app= express();

// Middleware and configurations specific to the admin panel can be added here

// Routes for the admin panel
router.get('/', (req, res) => {
  // Render the admin panel home page
  res.render('admin');
});

router.get('/users', (req, res) => {
  // Render other admin panel pages, e.g., user management
  res.render('admin_users');
});

// Add more routes for user registration, file upload, file sharing, etc.

module.exports = router;
