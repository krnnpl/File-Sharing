// const express = require('express');
// const bodyParser = require('body-parser');
// const authRoutes = require('./routes/auth');

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(bodyParser.json());

// // Connect to MongoDB
// const connectDB = require('./config/db');
// connectDB();


// // Routes
// app.use('/api/auth', authRoutes);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });







const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();


// Define the secret key for signing the access token
const secretKey = process.env.SECRET_KEY; // Replace with your actual secret key

const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const path = require('path');
const hbs = require("hbs");
const { registerPartials } =require("hbs");
// const router = express.Router();


const app = express();
const PORT = 3000;
const searchRoute = require('./routes/search');

//setting path
//const staticpath = path.join(__dirname,"../public");
const templatepath =path.join(__dirname,"/templates/views");
const partialpath = path.join(__dirname, "/templates/partials");


// Middleware
app.use(bodyParser.json());
// Add these lines before defining the router
app.use(cookieParser());
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);

// Connect to MongoDB
connectDB();

//view engine configuration
//app.set('view engine', 'hbs');

app.use('/css', express.static(path.join(__dirname,"../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname,"../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname,"../node_modules/jquery/dist")));
// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoute);


app.set('views', path.join(__dirname, '/templates/views'));
app.set('view engine', 'hbs');
app.set("views", templatepath);
hbs.registerPartials(partialpath);



app.get('/', (req, res) => {
  res.render("login");
  });
  
  app.get('/inbox', (req, res) => {
      res.render("inbox");
      });
  
  
  
  
      app.get('/compose', (req, res) => {
          res.render("compose");
  
      });
  
      app.get('/sent', (req, res) => {
          res.render("sent");
  
      });
  
  
  app.get('/login', (req, res) => {
      res.send('Hello signin  world from server')
  
  });
  const adminRouter = require('./admin');
  app.use('/admin', adminRouter);
// // Render admin login page for frontend
// app.get('/admin/login', (req, res) => {
//   res.render('admin-login');
// });
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
