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
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const path = require('path');
// const router = express.Router();


const app = express();
const PORT = 3000;
const searchRoute = require('./routes/search');


// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

//view engine configuration
app.set('view engine', 'hbs');


// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoute);



// Render admin login page for frontend
app.get('/admin/login', (req, res) => {
  res.render('admin-login');
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
