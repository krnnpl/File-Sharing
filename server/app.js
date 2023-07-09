const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const hbs = require("hbs");
const { registerPartials } =require("hbs");
const router = express.Router();


dotenv.config({ path: './config.env' });

require('./db/conn');

//setting path
//const staticpath = path.join(__dirname,"../public");
const templatepath =path.join(__dirname,"../templates/views");
const partialpath = path.join(__dirname, "../templates/partials");

//middleware
app.use('/css', express.static(path.join(__dirname,"../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname,"../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname,"../node_modules/jquery/dist")));
//app.use(express.static(staticpath))


  
const User = require('./model/userSchema');
const File = require('./model/fileSchema');


app.use(express.json());
app.use(require('./routers/auth'))

const PORT = process.env.PORT;


app.set('views', path.join(__dirname, '../templates/views'));
app.set('views', path.join(__dirname, '../templates/views/admin'));
app.set('view engine', 'hbs');
app.set("views", templatepath);
hbs.registerPartials(partialpath);


// Routes 
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));





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

app.listen(PORT, () => {
    console.log(`server is running at port no ${PORT}`);
})