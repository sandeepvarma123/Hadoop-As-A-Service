var request = require('request');
const fs = require('fs');


var execute_java_job = (mainClassName,txtFileName,jarFileName)=>{
    
  var Interval;
  var previousStatus = "";
  
  //step7: get job status
  //till info.lastModTime
  function get_job_status(token,job_execution_id){
    request.get({
      url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/job-executions/'+job_execution_id,
      headers: {
        'Content-Type':'application/json',
        'X-Auth-Token' : token
      },
    },function(err,response,body){
      if(err){
        console.log(err);
      }
      var res = JSON.parse(body);
      var currStatus = res.job_execution.info.status;
      if(previousStatus.toString() != currStatus.toString()){
        console.log("Job Status: "+ currStatus);
      }
      previousStatus = currStatus;
      /*
        res.job_execution.info.status!="RUNNING" because sometimes during at RUNNING state API lastModTime is being set
        To avoid this situation we included this case
      */
      if(typeof res.job_execution.info.lastModTime !== 'undefined' && res.job_execution.info.lastModTime && res.job_execution.info.status!="RUNNING"){
  
        clearInterval(Interval);
        console.log("Job Execution completed");
      }
    });
  }
  
  //step6: run the job
  function run_job(token,job_id){
    console.log("Attempting to run the Job");
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
      //console.log(res.job_execution.id);
      console.log("Starting the Job");
      console.log("Retrieving the Job Status");
      Interval = setInterval(function(){get_job_status(token,res.job_execution.id);},3000);
    });
  }
  
  //step5: Get Cluster ID
  
  //step4: creating job template
  function create_job_template(token,lib_id){
    console.log("Creating Job Template");
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
      //console.log(res.job.id);
      console.log("Job Template Created Successfully");
      run_job(token,res.job.id);
  
    });
  }
  
  //step3: creating job binary from swift container
  function create_job_binary(token){
    console.log("Creating Job Binaries");
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
         //console.log(res.job_binary.id);
         console.log("Job Binaries created successfully");
         create_job_template(token,res.job_binary.id);      
    });
  }
  
  
  //step2: upload script file to swift
  function swift_container_upload(token){
    console.log("Uploading Script Files");
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
          //console.log(response.statusMessage);
          console.log("Files uploaded successfully");
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
          console.log("Verifying credentails");
           if(err){
             console.log(err);
           }
           var token =  response.headers['x-subject-token'];
           console.log("Credentails Verified. User Authenticated");
           swift_container_upload(token);
        }
  );
  
}

module.exports.execute_java_job = execute_java_job;