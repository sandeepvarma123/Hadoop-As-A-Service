const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const javaJob= require('./jobs/java_execution');
const mapReduceJob= require('./jobs/mapReduce_execution');
const pigJob= require('./jobs/pig_execution');
const sparkJob= require('./jobs/spark_execution');
const { ensureAuthenticated } = require('../config/auth');
const nrc = require('node-run-cmd');
const path = require('path');
const zipFolder = require('zip-folder');


//API ENDPOINTS
const swift_url    = require('../config/api_endpoints').swift;
const keystone_url = require('../config/api_endpoints').keystone;
const compute_url = require('../config/api_endpoints').compute;

const request = require('request');

const History = require('../models/History');
const User = require('../models/User');

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
    
   History.find({email: req.user.email},function (err, data) {

    if(err)
    {
        console.log(err);
    }
       console.log(data);
      // console.log(data[0]);
       res.render('jobHistory', {        
        name: req.user.name,
        isAdmin : req.user.isadmin,
        data 
        })  
   });
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
            callback(null, Date.now()+"_"+file.originalname);
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

            res.setHeader('Connection', 'Transfer-Encoding');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.write("Files uploaded successfully<br>");
            
            javaJob.execute_java_job(mainClassName,txtFileName,jarFileName,email,res);
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
            callback(null, Date.now()+"_"+file.originalname);
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

            res.setHeader('Connection', 'Transfer-Encoding');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.write("Files uploaded successfully<br>");
            
            pigJob.execute_pig_job(txtFileName,mainLibFileName,libFileName,email,res);
    }); 

});

router.get('/launch_hadoop',ensureAuthenticated,(req,res)=>{
    function openConsole(token){
        request.post({
            url: compute_url+"/servers/8cd7f5e7-da0b-4939-ac7c-435d5e063e50/action",
            headers: {
              'Content-Type':'application/json',
              'X-Auth-Token' : token
            },
            body:  JSON.stringify({
                "os-getVNCConsole": {
                   "type": "novnc"
                 }
                })
            },
             (err,response,body) => {
                 if(err){
                   console.log(err);
                 }
                 var result = JSON.parse(body);
                 var link =  result.console.url;
                 res.redirect(link);
                 
              }
        );  
    }
   
    request.post({
        url: keystone_url+'/v3/auth/tokens',
        headers: {
          'Content-Type':'application/json',
          
        },
        body:  JSON.stringify({     
              "auth": { "identity": { "methods": [ "password" ], "password": { "user": { "name": "admin", "domain": { "name": "Default" }, "password": "ghost0197" } } } } } )
        },
         (err,response,body) => {
             if(err){
               console.log(err);
             }
             var token =  response.headers['x-subject-token'];
             console.log(token);
             openConsole(token);
          }
    );

});

router.get('/launch_spark',ensureAuthenticated,(req,res)=>{
    function openConsole(token){
        request.post({
            url: compute_url+"/servers/1f9fb7fb-46e5-497f-b68a-d022b4710973/action",
            headers: {
              'Content-Type':'application/json',
              'X-Auth-Token' : token
            },
            body:  JSON.stringify({
                "os-getVNCConsole": {
                   "type": "novnc"
                 }
                })
            },
             (err,response,body) => {
                 if(err){
                   console.log(err);
                 }
                 var result = JSON.parse(body);
                 var link =  result.console.url;
                 res.redirect(link);
                 
              }
        );  
    }
   
    request.post({
        url: keystone_url+'/v3/auth/tokens',
        headers: {
          'Content-Type':'application/json',
          
        },
        body:  JSON.stringify({     
              "auth": { "identity": { "methods": [ "password" ], "password": { "user": { "name": "admin", "domain": { "name": "Default" }, "password": "ghost0197" } } } } } )
        },
         (err,response,body) => {
             if(err){
               console.log(err);
             }
             var token =  response.headers['x-subject-token'];
             console.log(token);
             openConsole(token);
          }
    );

});

router.get('/download',ensureAuthenticated,(req,res)=>{

    console.log("enered");
     var dataCallback = function(data) {
        console.log(data);
        zipFolder('./public/swift_download/output','./public/swift_download/results.zip',(err)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log("Files Zipped succesfully!!");
                res.download('./public/swift_download/results.zip');
                console.log("Files downloaded successfully!");
            }
 
        }); 
      };

    var errorCallback = (error) => {
        console.log(error);
    }

    function download(token){
        console.log("Download");
        var command  = "swift --os-auth-token "+token+"       --os-storage-url "+swift_url+"       download --output-dir public/swift_download  hadoop";
        var options = { cwd: 'Downloads' };
        nrc.run(command,  { onData: dataCallback , onError: errorCallback });
    }

    
      request.post({
        url: keystone_url+'/v3/auth/tokens',
        headers: {
          'Content-Type':'application/json',
        },
        body:  JSON.stringify({     
              "auth": { "identity": { "methods": [ "password" ], "password": { "user": { "name": "admin", "domain": { "name": "Default" }, "password": "ghost0197" } } } } } )
        },
         (err,response,body) => {
             if(err){
               console.log(err);
             }
             var token =  response.headers['x-subject-token'];
             console.log(token);
             download(token);
          }
    );  
    

     //res.download('./public/swift_download/results.zip');

    
    
});

router.get('/spark', ensureAuthenticated ,(req,res) => {
    //console.log(req.user);
    res.render('spark', {
        name: req.user.name,
        isAdmin : req.user.isadmin
    })
});

router.post('/spark',ensureAuthenticated,(req,res) => {

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
            callback(null, Date.now()+"_"+file.originalname);
        }
    });

    var upload = multer({ storage: Storage }).array("imgUploader", 2); //Field name and max count

     upload(req, res, function (err) { 
            if (err) { 
                console.log(err); 
            } 

            console.log("Files Uploaded To Public Folder Successfuly");
            console.log(res.req.files);
            txtFileName = res.req.files[0].filename;
            mainLibFileName = res.req.files[1].filename;
            mainClassName = req.body.mainClass;
            email = req.user.email;
            
            console.log(txtFileName);

            res.setHeader('Connection', 'Transfer-Encoding');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            console.log("Files uploaded successfully");
            res.write("Files uploaded sucessfully!.<br>");

            
           sparkJob.execute_spark_job(txtFileName,mainLibFileName,mainClassName,email,res);
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
            callback(null, Date.now()+"_"+file.originalname);
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

            res.setHeader('Connection', 'Transfer-Encoding');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            console.log("Files uploaded successfully");
            res.write("Files uploaded sucessfully!.<br>");
            
            mapReduceJob.execute_mapReduce_job(mapperClassName,reducerClassName,txtFileName,libFileName,email,res);

    }); 

});

module.exports = router;