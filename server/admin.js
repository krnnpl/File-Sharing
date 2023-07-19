const express = require('express');
const router = express.Router();
const app= express();
const path = require('path');
const hbs = require("hbs");
const { registerPartials } =require("hbs");

const templatepath =path.join(__dirname,"../templates/views/admin");
const partialpath = path.join(__dirname, "../templates/partials");




app.set('views', path.join(__dirname, '../templates/views/admin'));
app.set('view engine', 'hbs');
app.set("views", templatepath);
hbs.registerPartials(partialpath);




// Routes for the admin panel
router.get('/', (req, res) => {
  // Render the admin panel home page
  res.render('admin/admin');
});



router.get('/inbox', (req, res) => {
  
  res.render('admin/inbox');
});

router.get('/users', (req, res) => {
  
  res.render('admin/users');
});
router.get('/register', (req, res) => {
  
  res.render('admin/register');
});






module.exports = router;
