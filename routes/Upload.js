const express = require('express'); 
const multer = require('multer'); 
const router = express.Router(); 


var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads");
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});


var upload = multer({ storage: Storage }).array("imgUploader", 2); //Field name and max count 

router.get("/Upload", (req, res) =>  {
    
    res.render('fileupload');
}); 
  
router.post("/Upload", function (req, res) { 
    console.log(req.body);
    upload(req, res, function (err) { 
        if (err) { 
            console.log(err);
            return res.end("Something went wrong in 1!"); 
        } 

        return res.end("Files uploaded sucessfully!."); 
    }); 
   
}
); 

module.exports = router;