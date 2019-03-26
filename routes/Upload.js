const express = require('express'); 
const multer = require('multer'); 
//var bodyParser = require('body-parser');
const router = express.Router(); 
//var app = Express(); 
//app.use(bodyParser.json()); 

var Storage1 = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads");
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});

/*var Storage2 = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads");
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});*/

var upload1 = multer({ storage: Storage1 }).array("imgUploader", 2); //Field name and max count 
//var upload2 = multer({ storage: Storage1 }).array("imgUploader2", 1);

//array(fieldname[, maxCount]);

router.get("/Upload", (req, res) =>  {
    
    res.render('fileupload');
}); 
  
router.post("/Upload", function (req, res) { 
    console.log(req.body);
    upload1(req, res, function (err) { 
        if (err) { 
            console.log(err);
            return res.end("Something went wrong in 1!"); 
        } 

       /* upload2(req, res, function (err) { 
            if (err) { 
                console.log(err);
                return res.end("Something went wrong in 2!"); 
            } 
            
           // return res.end("File2 uploaded sucessfully!."); 
        }); */
        
        return res.end("Files uploaded sucessfully!."); 
    }); 
   
}
); 

module.exports = router;