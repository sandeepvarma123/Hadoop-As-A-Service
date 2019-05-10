const mergeFiles = require('merge-files');
var nrc = require('node-run-cmd');

var concat = require('concat-files');
 
concat([
  '../public/swift_download/input.txt',
  '/another/file',
  '/one/last/file'
], '/to/destination', function(err) {
  if (err) throw err
  console.log('done');
});
/*
// status: true or false
const status = await mergeFiles(inputPathList, outputPath);
// or

*/

mergeFiles(inputPathList, outputPath).then((status) => {
    console.log(status)
});

/*

var dataCallback = function(data) {
    console.log(data);
  };

var command  = "swift --os-auth-token gAAAAABc0Pxr84FlzR3ShXOa-kqSE7ywDEcm1IaMxdH9KwRg_--W618hXfkGMRh3h-1_1bZ8IzBNDi8SFlY-hlypPTJTG1gR46A4mCkfGfverXsRN5vWNfJAV0f1QBVc0Iysw-_Ga96i-VidDPMPk8OjRZlkKdzMU3sCuiZMWOJNwYNXvIj9d6k       --os-storage-url http://172.16.2.140:8080/v1/AUTH_f707217e4584400785eb5980100d13e6       download  hadoop";
var options = { cwd: '../../../' };
console.log(options.cwd);
nrc.run(command, { onData: dataCallback , onError: dataCallback } , options);

*/

/*

app.get('/download', function(req, res){
  var file = __dirname + '/upload-folder/dramaticpenguin.MOV';
  res.download(file); // Set disposition and send it.
});

*/

/*

res.download('/report-12345.pdf');

res.download('/report-12345.pdf', 'report.pdf');

res.download('/report-12345.pdf', 'report.pdf', function(err){
  if (err) {
    // Handle error, but keep in mind the response may be partially-sent
    // so check res.headersSent
  } else {
    // decrement a download credit, etc.
  }
});

*/