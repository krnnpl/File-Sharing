const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser=require('body-parser');
const session= require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const hbs = require("hbs");
const { registerPartials } =require("hbs");
const router = express.Router();
const authRoutes = require('./routers/auth');
const messageRoutes = require('./routers/message');
const searchRoutes = require('./routers/search');


dotenv.config({ path: './config.env' });
require('dotenv').config();

require('./db/conn');

const secretKey= process.env.SECRET_KEY

//setting path
//const staticpath = path.join(__dirname,"../public");
const templatepath =path.join(__dirname,"../templates/views");
const partialpath = path.join(__dirname, "../templates/partials");

//middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    session({
        secret:secretKey,
        resave: false,
        saveUninitialized: false,
    })
);
app.use('/css', express.static(path.join(__dirname,"../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname,"../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname,"../node_modules/jquery/dist")));
//app.use(express.static(staticpath))


  
const User = require('./model/userSchema');
const Message = require('./model/messageSchema');


app.use(express.json());
app.use(require('./routers/auth'))

const PORT = process.env.PORT;
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);




app.set('views', path.join(__dirname, '../templates/views'));
app.set('views', path.join(__dirname, '../templates/views/admin'));
app.set('view engine', 'hbs');
app.set("views", templatepath);
hbs.registerPartials(partialpath);


// Routes 
//app.use('/api/files', require('./routes/files'));
//app.use('/files', require('./routes/show'));
//app.use('/files/download', require('./routes/download'));





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
    app.get('/profile', (req, res) => {
        res.render("profile");
    });
    app.get('/logout', (req, res) => {
        // Clear the access token from the session or cookie
        req.session.accessToken = null; // If using session
        res.clearCookie('accessToken'); // If using cookie, replace 'accessToken' with the actual name of your cookie
      
        // Redirect the user to the login page or any other appropriate page
        res.redirect('/');
      });
      app.get('/logout-admin', (req, res) => {
        // Clear the access token from the session or cookie
        req.session.accessToken = null; // If using session
        res.clearCookie('accessToken'); // If using cookie, replace 'accessToken' with the actual name of your cookie
      
        // Redirect the user to the login page or any other appropriate page
        res.redirect('/admin');
      });








const adminRouter = require('./admin');
app.use('/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`server is running at port no ${PORT}`);
})