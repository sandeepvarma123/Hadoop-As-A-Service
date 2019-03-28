const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const javaJob= require('./jobs/java_execution');
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

 


router.post('/java',ensureAuthenticated,(req,res) => {

    var txtFileName;
    var jarFileName;
    var mainClassName;

    //uploading  files to public folder
    var Storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./public/uploads");
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });

    var upload = multer({ storage: Storage }).array("imgUploader", 2); //Field name and max count

     upload(req, res, function (err) { 
            if (err) { 
                console.log(err); 
            } 

            console.log("Files Uploaded To Public Folder Successfuly");
            txtFileName = res.req.files[0].filename;
            jarFileName = res.req.files[1].filename;
            mainClassName = req.body.mainClass;
            console.log(mainClassName);
            
            javaJob.execute_java_job(mainClassName,txtFileName,jarFileName);

            return res.end("Files uploaded sucessfully!.");
    }); 


    

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