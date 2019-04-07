const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const javaJob= require('./jobs/java_execution');
const mapReduceJob= require('./jobs/mapReduce_execution');
const pigJob= require('./jobs/pig_execution');
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

//admin page
router.get('/AdminPage', ensureAuthenticated, (req,res) => {
    //console.log(req.user);
    res.render('AdminPage', {
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
    var email;

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
            email = req.user.email;
            
            javaJob.execute_java_job(mainClassName,txtFileName,jarFileName,email);

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

router.post('/pig',ensureAuthenticated,(req,res) => {

    var txtFileName;
    var mainLibFileName;
    var libFileName;
    var email;

    //uploading  files to public folder
    var Storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./public/uploads");
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });

    var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count

     upload(req, res, function (err) { 
            if (err) { 
                console.log(err); 
            } 

            console.log("Files Uploaded To Public Folder Successfuly");
            console.log(res.req.files);
            txtFileName = res.req.files[0].filename;
            mainLibFileName = res.req.files[1].filename;
            libFileName = res.req.files[2].filename;
            email = req.user.email;
            
            pigJob.execute_pig_job(txtFileName,mainLibFileName,libFileName,email);

            return res.end("Files uploaded sucessfully!.");
    }); 

});

router.get('/mapReduce', ensureAuthenticated ,(req,res) => {
    //console.log(req.user);
    res.render('mapReduce', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});

router.post('/mapReduce',ensureAuthenticated,(req,res) => {

    var txtFileName;
    var libFileName;
    var mapperClassName;
    var reducerClassName;
    var email;

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
            libFileName = res.req.files[1].filename;
            mapperClassName = req.body.mapperClass;
            reducerClassName = req.body.reducerClass;
            email = req.user.email;
            
            mapReduceJob.execute_mapReduce_job(mapperClassName,reducerClassName,txtFileName,libFileName,email);

            return res.end("Files uploaded sucessfully!.");
    }); 

});

module.exports = router;