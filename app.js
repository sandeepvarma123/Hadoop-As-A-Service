const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const multipart = require('parse-multipart');
const app = express();
app.use(bodyParser.json()); 
app.use(express.json());
app.use(express.urlencoded({extended:false}));
//app.use(express.multipart());




//set static folder
app.use(express.static(path.join(__dirname,'public')));


//Passport Config
require('./config/passport')(passport);

//DataBase Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db,{useNewUrlParser : true})
    .then(() => console.log('MongoDB Connected.......'))
    .catch(err => console.log(err));

//EJS
app.set('view engine','ejs');
app.set('views','./views');

//Body Parser
app.use(express.urlencoded({extended: false}));

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global Variables
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Routes
app.use(require('./routes/index'));
app.use(require('./routes/users'));
app.use(require('./routes/Upload'));
app.use(require('./routes/admin'));


const PORT = process.env.PORT || 5005;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

