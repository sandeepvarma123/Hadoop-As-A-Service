const request = require('request');
const fs = require('fs');
const path = require('path');


var execute_mapReduce_job = (mapperClass,reducerClass,txtFileName,jarFileName)=>{
   
  var Interval;
  var previousStatus = "";
  
  //step8: get job status
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
  
  //step7: run the job
  function run_job(token,job_id,hadoop_cluster_id,input_ds_id,output_ds_id){
    console.log("Attempting to run the Job");
    request.post({
      url:'http://172.16.2.140:8386/v1.1/109d5a0fef34423582747e609b8c6c0f/jobs/'+job_id+'/execute',
      headers: {
        'Content-Type':'application/json',
        'X-Auth-Token' : token
      },
      body: JSON.stringify({
        "cluster_id": hadoop_cluster_id,
        "input_id": input_ds_id,
        "output_id":output_ds_id,
        "job_configs": {
            "configs": {
                "mapred.reducer.new-api" : "true",
                "mapred.mapper.new-api":"true",
                "mapreduce.job.map.class":mapperClass,
                "mapreduce.job.reduce.class":reducerClass, 
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

  //step6: get data sources id
  function get_sources_id(token,job_id,hadoop_cluster_id){
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

          run_job(token,job_id,hadoop_cluster_id,input_ds_id,output_ds_id);
    
    });
}
  
  //step5: Get Cluster ID
  function get_cluster_id(token,job_id){

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

          get_sources_id(token,job_id,hadoop_cluster_id);
          
    })
}
  
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
        "libs": [
           lib_id
        ],
        "type": "MapReduce",
        "name": path.parse(jarFileName).name
    })
    },(err,response,body)=>{
      if(err){
        console.log(err);
      }
      var res = JSON.parse(body);
      //console.log(res.job.id);
      console.log("Job Template Created Successfully");
      get_cluster_id(token,res.job.id);
  
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
        "url": "swift://scripts/"+jarFileName,
        "name": jarFileName,
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
  function swift_container_script_upload(token){
    console.log("Uploading Script Files");
    //upload to swift container
    fs.createReadStream('public/uploads/'+jarFileName).pipe(request.put({
        url: 'http://172.16.2.140:8080/v1/AUTH_109d5a0fef34423582747e609b8c6c0f/scripts/'+jarFileName,
        json: true,
        headers: {
          'Content-Type':'application/json',
          'X-Auth-Token' : token
        }
      },(err,response,body)=>{
          
          if(err){
            console.log(err);
          }
          console.log("Script Files uploaded successfully");
          create_job_binary(token)
      })
    ) 
  }

  //step2: upload input file to swift
  function swift_container_input_upload(token){
    console.log("Uploading Input Files");
    //upload to swift container
    fs.createReadStream('public/uploads/'+txtFileName).pipe(request.put({
        url: 'http://172.16.2.140:8080/v1/AUTH_109d5a0fef34423582747e609b8c6c0f/hadoop/input',
        json: true,
        headers: {
          'Content-Type':'application/json',
          'X-Auth-Token' : token
        }
      },(err,response,body)=>{
          
          if(err){
            console.log(err);
          }
          console.log("Input Files uploaded successfully");
          swift_container_script_upload(token);
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
           swift_container_input_upload(token);
        }
  );
  
}

module.exports.execute_mapReduce_job = execute_mapReduce_job;