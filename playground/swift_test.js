var request = require('request');
const fs = require('fs');

/*
var body = {"job_binary": {"name": "hadoop1.jar", "url": "swift://scripts/hadoop1.jar", "tenant_id": "109d5a0fef34423582747e609b8c6c0f", "created_at": "2019-03-23T07:16:41", "is_protected": false, "is_public": false, "id": "2e6350ce-6cbe-4600-9e85-f580d0497443"}};
//body = JSON.parse(body);
console.log(body["job_binary"]["id"]);
*/



function swift_container(token){
  
  //upload to swift container
  fs.createReadStream('hadoop.jar').pipe(request.put({
      url: 'http://172.16.2.140:8080/v1/AUTH_109d5a0fef34423582747e609b8c6c0f/scripts/hadoop1.jar',
      headers: {
        'Content-Type':'application/json',
        'X-Auth-Token' : token
      }
    },(err,response,body)=>{
        if(err){
          console.log(err);
        }
        console.log(response.statusMessage);
    })
  ) 

  //create job binary
  request.post({
    url: 'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/job-binaries',
    headers: {
      'Content-Type':'application/json',
      'X-Auth-Token' : token
    },
    body:  JSON.stringify({
      "url": "swift://scripts/hadoop1.jar",
      "name": "hadoop1.jar",
      "extra": {
        "password": "ghost0197",
        "user": "admin"
      }
    })
  },(err,response,body)=>{
       console.log(body);
       
  });

  //list job binaries and get ID


}

  request.post({
    url: 'http://172.16.2.140/identity/v3/auth/tokens',
    headers: {
      'Content-Type':'application/json'
    },
    body:  JSON.stringify({
        
          "auth": {
              "identity": {
                  "methods": [
                      "password"
                  ],
                  "password": {
                      "user": {
                          "name": "admin",
                          "domain": {
                              "name": "Default"
                          },
                          "password": "ghost0197"
                      }
                  }
              }
        
        }
      })
    }, (err,response,body) => {
         var token =  response.headers['x-subject-token'];
         swift_container(token);
      });

