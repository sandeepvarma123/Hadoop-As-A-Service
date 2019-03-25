var request = require('request');
const fs = require('fs');

//step7: get job status
//till info.lastModTime
function get_job_status(token,job_execution_id){
  request.get({
    url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/job-executions/'+job_execution_id,
    headers: {
      'Content-Type':'application/json',
      'X-Auth-Token' : token
    },
  },(err,response,body)=>{
    if(err){
      console.log(err);
    }
    var res = JSON.parse(body);
    console.log(res.job_execution.info.status);
  });
}

//step6: run the job
function run_job(token,job_id){
  request.post({
    url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/jobs/'+job_id+'/execute',
    headers: {
      'Content-Type':'application/json',
      'X-Auth-Token' : token
    },
    body: JSON.stringify({
      "cluster_id": "c0ddacb0-c2a7-4e30-9db7-022fb8027deb",
      "job_configs": {
          "configs": {
              "edp.java.main_class" : "org.openstack.sahara.examples.WordCount",
              "fs.swift.service.sahara.username":"admin",
              "fs.swift.service.sahara.password":"ghost0197",
              "edp.java.adapt_for_oozie":"True",
              "edp.hbase_common_lib":"True",
              "edp.substitute_data_source_for_name":"True",
              "edp.substitute_data_source_for_uuid":"True"
          },
          "args": [
              "input-ds",
              "output-ds"
          ]
      }
  })
  },(err,response,body)=>{
    if(err){
      console.log(err);
    }
    var res = JSON.parse(body);
    console.log(res.job_execution.id);
    get_job_status(token,res.job_execution.id);
  });
}

//step5: Get Cluster ID

//step4: creating job template
function create_job_template(token,lib_id){

  request.post({
    url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/jobs',
    headers: {
      'Content-Type':'application/json',
      'X-Auth-Token' : token
    },
    body: JSON.stringify({
      "description": "Demo Job  Created By APIs",
      "libs": [
         lib_id
      ],
      "type": "Java",
      "name": "Hadoop1-Example"
  })
  },(err,response,body)=>{
    if(err){
      console.log(err);
    }
    var res = JSON.parse(body);
    console.log(res.job.id);
    run_job(token,res.job.id);

  });
}

//step3: creating job binary from swift container
function create_job_binary(token){
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
    }),
  },(err,response,body)=>{
       if(err){
         console.log(err);
       }
       var res = JSON.parse(body);
       console.log(res.job_binary.id);

       create_job_template(token,res.job_binary.id);      
  });
}


//step2: upload script file to swift
function swift_container_upload(token){
  
  //upload to swift container
  fs.createReadStream('hadoop.jar').pipe(request.put({
      url: 'http://172.16.2.140:8080/v1/AUTH_109d5a0fef34423582747e609b8c6c0f/scripts/hadoop1.jar',
      json: true,
      headers: {
        'Content-Type':'application/json',
        'X-Auth-Token' : token
      }
    },(err,response,body)=>{
        if(err){
          console.log(err);
        }
        console.log(response.statusMessage);
        create_job_binary(token)
    })
  ) 
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
         swift_container_upload(token);
      }
);

