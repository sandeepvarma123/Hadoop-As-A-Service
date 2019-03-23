var request = require('request');
const fs = require('fs');


function swift_container(token){

 /* request.get({
    url : 'http://172.16.2.140:8080/v1/AUTH_109d5a0fef34423582747e609b8c6c0f',
    headers: {
      'Content-Type':'application/json',
       'X-Auth-Token' : token
    }
  },(err,response,body)=>{
      console.log(body);
  });*/

  fs.createReadStream('helloworld.rar').pipe(request.put({
    url: 'http://172.16.2.140:8080/v1/AUTH_109d5a0fef34423582747e609b8c6c0f/scripts/helloworld.rar',
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

