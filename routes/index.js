const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

//Welcome page
router.get('/', (req,res) => res.render('signin'));
//Dashboard page
router.get('/index', ensureAuthenticated, (req,res) => {
    //console.log(req.user);
    res.render('index', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});

router.get('/jobHistory', ensureAuthenticated, (req,res) => {
    //console.log(req.user);
    res.render('jobHistory', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});

router.get('/java', ensureAuthenticated , (req,res) => {
    //console.log(req.user);
    res.render('java', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});
router.get('/pig', ensureAuthenticated ,(req,res) => {
    //console.log(req.user);
    res.render('pig', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});
router.get('/mapReduce', ensureAuthenticated ,(req,res) => {
    //console.log(req.user);
    res.render('mapReduce', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});

module.exports = router;