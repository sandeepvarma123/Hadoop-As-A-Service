const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User Model
const User = require('../models/User');
//const History = require('../models/History');

//Login Page
router.get('/signin', (req,res) => res.render('signin'));
//Register Page
router.get('/signup', (req,res) => res.render('signup'));

//Register Handle
router.post('/signup', (req, res) => {
    console.log(req.body)
   // res.send('helloooo');
   const {name, email, password, password2} = req.body;
   let errors = [];
   console.log(name);
   console.log(email);
   console.log(password);
   console.log(password2);

   //Validation
   if(!name || !email || !password || !password2) {
       errors.push({msg: 'Please fill in all the fields...'});
   }
   if(password !== password2) {
       errors.push({ msg: 'Passwords do not match...'});
   }
  

   if(errors.length>0) {
       res.render('signup',{
           errors,
           name,
           email,
           password,
           password2
       });
   } else {
      //Validation passed
      User.findOne({ email: email})
      .then(user => {
          if(user){
              //user exists
              errors.push({msg: 'Email is already registered...'});
              res.render('signup',{
                errors,
                name,
                email,
                password,
                password2
            }); 

          } else {
              const newUser = new User({
                  name,
                  email,
                  password
              });
             // console.log(newUser);
             // res.send('helloo');

             //Hash password
             bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newUser.password, salt, (err,hash)=> {
                 if(err) throw err;
                 newUser.password = hash;
                 newUser.save()
                 .then(user => {
                     req.flash('success_msg','You are now registered');
                     res.redirect('/signin');
                 })
                 .catch(err => console.log(err));
             }))
          }
      });

   }

});


//Login handle
router.post('/signin', (req,res,next) => {
    passport.authenticate('local', {
        successRedirect: '/index',
        failureRedirect: '/signin',
        failureFlash: true
    })(req,res,next);
});

//Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are successfully logged out...');
    res.redirect('/signin');
})

module.exports = router;