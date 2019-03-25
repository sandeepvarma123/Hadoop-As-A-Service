var request = require('request');
//step2: get cluster id
function get_cluster_id(token){

    request.get({
        url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/clusters',
        headers: {
            'Content-Type':'application/json',
            'X-Auth-Token' : token
          }
    },(err,response,body)=>{
        if(err){
            console.log(err);
          }
          var res = JSON.parse(body);
          var hadoop_cluster_id;
          for(var cluster of res.clusters){
              if(cluster.name == "hadoop"){
                  hadoop_cluster_id = cluster.verification.cluster_id;
                  break;
              }
          }

          console.log(hadoop_cluster_id);
    })
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
         get_cluster_id(token);
      }
);