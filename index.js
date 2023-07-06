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

const app = express();
const PORT = 3000;
const searchRoute = require('./routes/search');


// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoute);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
