const request = require('request');
const fs = require('fs');
const path = require('path');
const History = require('../../models/History');

//API ENDPOINTS
const keystone_url = require('../../config/api_endpoints').keystone;
const sahara_url   = require('../../config/api_endpoints').sahara;
const swift_url    = require('../../config/api_endpoints').swift;

//CLUSTER NAMES
const hadoop = require('../../config/cluster_names').hadoop;
const spark  = require('../../config/cluster_names').spark;


var execute_mapReduce_job = (mapperClass,reducerClass,txtFileName,jarFileName,email,res1)=>{
   
  var Interval;
  var previousStatus = "";
  
  //step8: get job status
  //till info.lastModTime
  function get_job_status(token,job_execution_id){
    request.get({
      url:sahara_url+'/job-executions/'+job_execution_id,
      headers: {
        'Content-Type':'application/json',
        'X-Auth-Token' : token
      },
    },function(err,response,body){
      if(err){
        console.log(err);
        return res1.end(err);
      }
      console.log(body);
      var res = JSON.parse(body);
      var currStatus = res.job_execution.info.status;
      if(previousStatus.toString() != currStatus.toString()){
        console.log("Job Status: "+ currStatus);
        res1.write("Job Status: "+ currStatus+"<br>");
      }
      previousStatus = currStatus;
      /*
        res.job_execution.info.status!="RUNNING" because sometimes during at RUNNING state API lastModTime is being set
        To avoid this situation we included this case
      */
      if(typeof res.job_execution.info.lastModTime !== 'undefined' && res.job_execution.info.lastModTime && res.job_execution.info.status!="RUNNING"){
  
        clearInterval(Interval);
        console.log("Job Execution completed");
        res1.write("Job Execution completed<br>");
        console.log("Uploading job history to database");
        res1.write("Uploading job history to database<br>");
        var java_history = new History({email:email,type:'MapReduce',jobName:path.parse(jarFileName).name,jobStatus:res.job_execution.info.status});
         java_history.save((err)=>{
            if(err){
              console.log(err);
              return res1.end(err);
            }
            else{
              console.log("Uploaded job history to database..Success");
              res1.write("Uploaded job history to database..Success");
              res1.write('<a href="/download">Download Your Files Here</a>');
            }
         });
      }
    });
  }
  
  //step7: run the job
  function run_job(token,job_id,hadoop_cluster_id,input_ds_id,output_ds_id){
    console.log("Attempting to run the Job");
    res1.write("Attempting to run the Job<br>");
    request.post({
      url:sahara_url+'/jobs/'+job_id+'/execute',
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
            }
        }
    })
    },(err,response,body)=>{
      if(err){
        console.log(err);
        return res1.write(err);
      }
      var res = JSON.parse(body);
      //console.log(res.job_execution.id);
      console.log("Starting the Job");
      res1.write("Starting the Job<br>");
      console.log("Retrieving the Job Status");
      res1.write("Retrieving the Job Status<br>");
      Interval = setInterval(function(){get_job_status(token,res.job_execution.id);},3000);
    });
  }

  //step6: get data sources id
  function get_sources_id(token,job_id,hadoop_cluster_id){
    request.get({
        url:sahara_url+'/data-sources',
        headers: {
            'Content-Type':'application/json',
            'X-Auth-Token' : token
          }
    
    },(err,response,body)=>{
        if(err){
            console.log(err);
            return res1.write(err);
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
          
          run_job(token,job_id,hadoop_cluster_id,input_ds_id,output_ds_id);
    });
}
  
  //step5: Get Cluster ID
  function get_cluster_id(token,job_id){

    request.get({
        url:sahara_url+'/clusters',
        headers: {
            'Content-Type':'application/json',
            'X-Auth-Token' : token
          }
    },(err,response,body)=>{
        if(err){
            console.log(err);
            return res1.end(err);
          }
          var res = JSON.parse(body);
          var hadoop_cluster_id;
          for(var cluster of res.clusters){
              if(cluster.name == hadoop){
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
    res1.write("Creating Job Template<br>");
    request.post({
      url:sahara_url+'/jobs',
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
        return res1.end(err);
      }
      var res = JSON.parse(body);
      //console.log(res.job.id);
      console.log("Job Template Created Successfully");
      res1.write("Job Template Created Successfully<br>");
      get_cluster_id(token,res.job.id);
  
    });
  }
  
  //step3: creating job binary from swift container
  function create_job_binary(token){
    console.log("Creating Job Binaries");
    res1.write("Creating Job Binaries<br>");
    //create job binary
    request.post({
      url:  sahara_url+'/job-binaries',
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
           return res1.end(err);
         }
         var res = JSON.parse(body);
         //console.log(res.job_binary.id);
         console.log("Job Binaries created successfully");
         res1.write("Job Binaries created successfully<br>");
         create_job_template(token,res.job_binary.id);      
    });
  }
  
  
  //step2: upload script file to swift
  function swift_container_script_upload(token){
    console.log("Uploading Script Files");
    res1.write("Uploading Script Files<br>");
    //upload to swift container
    fs.createReadStream('public/uploads/'+jarFileName).pipe(request.put({
        url: swift_url+'/scripts/'+jarFileName,
        json: true,
        headers: {
          'Content-Type':'application/json',
          'X-Auth-Token' : token
        }
      },(err,response,body)=>{
          
          if(err){
            console.log(err);
            return  res1.end(err);
          }
          console.log("Script Files uploaded successfully");
          res1.write("Script Files uploaded successfully<br>");
          create_job_binary(token)
      })
    ) 
  }

  //step2: upload input file to swift
  function swift_container_input_upload(token){
    console.log("Uploading Input Files");
    res1.write("Uploading Input Files<br>");
    //upload to swift container
    fs.createReadStream('public/uploads/'+txtFileName).pipe(request.put({
        url:  swift_url+'/hadoop/input',
        json: true,
        headers: {
          'Content-Type':'application/json',
          'X-Auth-Token' : token
        }
      },(err,response,body)=>{
          
          if(err){
            console.log(err);
            return res1.end(err);
          }
          console.log("Input Files uploaded successfully");
          res1.write("Input Files uploaded successfully<br>");
          swift_container_script_upload(token);
      })
    ) 
  }
  
  //step1: keystone authentication
  res1.write("Starting KeyStone Authentication Service<br>");
  request.post({
      url: keystone_url+'/v3/auth/tokens',
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
          res1.write("Verifying Credentials<br>");
           if(err){
             console.log(err);
             return res1.end(err);
           }
           var token =  response.headers['x-subject-token'];
           console.log("Credentails Verified. User Authenticated");
           res1.write("Credentails Verified. User Authenticated<br>");
           swift_container_input_upload(token);
        }
  );
  
}

module.exports.execute_mapReduce_job = execute_mapReduce_job;