const mongoose = require('mongoose');
require('dotenv').config();
const DB = process.env.DATABASE;

mongoose.connect(DB
).then(() => {
    console.log('Connection successful');
}).catch((err) => console.log(err));
