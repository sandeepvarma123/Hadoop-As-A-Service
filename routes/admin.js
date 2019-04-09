const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');

//activate user
router.post('/activate', (req,res) => {

    // console.log(req.body.email);
    
         User.findOneAndUpdate({email:req.body.email}, {$set:{isauthenticated:true}}, {new: true}, (err, doc) => {
             if (err) {
                 console.log("Something wrong when updating data!");
             }
             res.redirect('/AdminPage');
           
 
     }); 
     
 
 });
 
 
 //deactivate user
 router.post('/deactivate', (req,res) => {
 
     //console.log(req);
    
 
         User.findOneAndUpdate({email:req.body.email}, {$set:{isauthenticated:false}}, {new: true}, (err, doc) => {
             if (err) {
                 console.log("Something wrong when updating data!");
             }
             res.redirect('/AdminPage');
            
 
     });  
 
 });
 
 
 //admin page
 router.get('/AdminPage', ensureAuthenticated, (req,res) => {
     //console.log(req.user);
 
     User.find({},function(err,data){
 
         if(err){
             console.log(err);
         }
         res.render('AdminPage', {
             name: req.user.name,
             isAdmin : req.user.isadmin,
             data
         })
 
     });
 
     
 });

 module.exports = router;