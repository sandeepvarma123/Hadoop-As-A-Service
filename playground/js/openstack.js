var images = [ {"ubuntu_console_16": "89244ac0-bcd1-44c9-acf2-df01e4d60188"}];
var flavours = [ {"ds2G": "d3"}];

//alert(images["ubuntu_console_16"]);


$( document ).ready(function() {
             $("#launch").click(function(){
               var instanceName = $('#instance').val();
               var flavour = $('#flavour :selected').text();
               var image = $('#image :selected').text();
               if(instanceName!=""){
                   getToken(instanceName,flavour,image);
               }
               else{
                   alert("Instance Name Missing");
               }               
           });
        });

function getServerLink(serverLink,token){
	var instanceLink="";
	var data = {
		  "os-getVNCConsole": {		   
		     "type": "novnc"
		   }
    };

     $.ajax({
	    url: serverLink,
	    dataType: 'json',
	    type: 'post',
	    contentType: 'application/json',
	    data: JSON.stringify(data),
	    headers : {
	    	'X-Auth-Token' : token
	    },
	    processData: false,
	    success: function( data, textStatus, jQxhr ){
	       var obj=JSON.Parse(data);
	       instanceLink=obj.console.url;
	       alert(instanceLink);
	    },
	    error: function( jqXhr, textStatus, errorThrown ){
	        console.log( errorThrown );
	    }
    });
}
function getInstanceId(instanceName,flavour,image,token){
    var serverLink="";
	var instance_data = {
		    "server" : {
		        "name" : instanceName,
		        "imageRef" : "89244ac0-bcd1-44c9-acf2-df01e4d60188",
		        "key_name" : "ghost_01",
		        "flavorRef" : "d3",
		        "networks" : [{
		            "uuid" : "6ad26f7e-089b-49a7-8b69-5fbd591a7bd3"
		        }],
		        "availability_zone": "nova",
		        "OS-DCF:diskConfig": "AUTO",
		        "security_groups": [
		            {
		                "name": "default"
		            },
		            {
		                "name": "ghost_security_group_01"
		            }
		        ]
		    }
 	 };

 	 alert(token);

 	 $.ajax({
	    url: 'http://172.37.6.4/compute/v2.1/servers',
	    dataType: 'json',
	    type: 'post',
	    contentType: 'application/json',
	    data: JSON.stringify(instance_data),
	    headers : {
	    	'X-Auth-Token' :token
	    },
	    processData: false,
	    success: function( data, textStatus, jQxhr ){
	       serverLink=jQxhr.getResponseHeader('location');
	       serverLink+="/action";
	       getServerLink(serverLink,token);
    
	    },
	    error: function( jqXhr, textStatus, errorThrown ){
	        console.log( errorThrown );
	    }
    });
   
}

function getToken(instanceName,flavour,image){
    var token="";
	var access_data = {
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
	        },
		    "scope": { 
		    	"project": { 
		    		"domain": {
		    			"name": "default" 
		    		},
		    		"name":  "admin"
		        } 
		    }
	    }
};

	$.ajax({
    url: 'http://172.37.6.4/identity/v3/auth/tokens',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(access_data),
    processData: false,
    success: function( data, textStatus, jQxhr ){
       token=jQxhr.getResponseHeader('x-subject-token');
       getInstanceId(instanceName,flavour,image,token);
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
    }
});
}

