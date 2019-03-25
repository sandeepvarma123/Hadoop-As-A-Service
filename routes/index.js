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

router.get('/jobHistory', ensureAuthenticated, (req,res) => res.render('jobHistory'));

router.get('/java', ensureAuthenticated , (req,res) => res.render('java'));
router.get('/pig', ensureAuthenticated ,(req,res) => res.render('pig'));
router.get('/mapReduce', ensureAuthenticated ,(req,res) => res.render('mapReduce'));

module.exports = router;