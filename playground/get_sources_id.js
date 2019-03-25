var request = require('request');

//step2: get sources id
function get_sources_id(token){
    request.get({
        url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/data-sources',
        headers: {
            'Content-Type':'application/json',
            'X-Auth-Token' : token
          }
    
    },(err,response,body)=>{
        if(err){
            console.log(err);
          }
          var res = JSON.parse(body);
          var input_ds_id,output_ds_id;
          for( var data_source of res.data_sources ){
              if(data_source.name == "input-ds"){
                  input_ds_id = data_source.id;
              }
              if(data_source.name == "output-ds"){
                  output_ds_id = data_source.id;
            }
          }
          console.log(input_ds_id);
          console.log(output_ds_id);
    
    });
}


//step1: keystone authentication
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
    },
     (err,response,body) => {
         if(err){
           console.log(err);
         }
         var token =  response.headers['x-subject-token'];
         get_sources_id(token);
      }
);