const express = require('express'); 
const multer = require('multer'); 
//var bodyParser = require('body-parser');
const router = express.Router(); 
//var app = Express(); 
//app.use(bodyParser.json()); 

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads");
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: Storage }).array("imgUploader", 1); //Field name and max count 

//array(fieldname[, maxCount]);

router.get("/Upload", (req, res) =>  res.render('fileupload')
    //res.sendFile(__dirname + "/index.html"); 
); 
  
router.post("/Upload", function (req, res) { 
    upload(req, res, function (err) { 
        if (err) { 
            console.log(err);
            return res.end("Something went wrong!"); 
        } 
        return res.end("File uploaded sucessfully!."); 
    }); 
}); 

module.exports = router;