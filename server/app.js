const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

dotenv.config({ path: './config.env' });

require('./db/conn'); 
const User = require('./model/userSchema');
const File = require('./model/fileSchema');

app.use(express.json());
app.use(require('./router/auth'))
const PORT = process.env.PORT;

const middleware = (req, res, next) => {
    console.log('hello my middleware');
    next();

}



//app.get('/', (req, res) => {
//res.send('Hello world from server')

//});
app.get('/about', middleware, (req, res) => {
    console.log('Hello my middleware')
    res.send('Hello about world from server')

    app.get('/contact', (req, res) => {
        res.send('Hello contact  world from server')

    });

});
app.get('/login', (req, res) => {
    res.send('Hello signin  world from server')

});
app.get('/register', (req, res) => {
    res.send('Hello signup world from server')

});
app.listen(PORT, () => {
    console.log(`server is running at port no ${PORT}`);
})