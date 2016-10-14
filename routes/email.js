var express = require('express');
var router = express.Router();
var email = require('./smtp.js');
module.exports =  function(db){
	router.post('/', function(req, res, next) {
		if(!req.session || !req.session.login || req.session.role!="admin" || req.session.sjsuid!="admin")
		{
			var result = {
				"success":"false",
				"msg":"Not login as admin. Redirect to Login Page after 3 seconds",
				"redirectpage":"/view/login.html"
			};
			res.send(result);
		}
		else{
			var recv = req.body.recv.split(",");					
			db.collection('users').find({"sjsuid": {$in:recv}}).toArray(function(err,data){
				if(err!=null) res.send({"success":"false","msg":err});
				else{
					var us = {};
					for(var i=0;i<data.length;i++){	
						var row=data[i];
						us[row.sjsuid]=[row.lastname+" "+row.firstname,row.lastname,row.email,0];
					}
					db.collection('projects').find({"sjsuid": {$in:recv}}).toArray(function(err,data){
						if(err!=null) res.send({"success":"false","msg":err});
						else{
							for(var i=0;i<data.length;i++){
								us[data[i].sjsuid][3]+=parseFloat(data[i].points);
							}
							for(var i=0;i<recv.length;i++){
								var id = recv[i];
								var to = us[id][2];
								var sub = req.body.sub;
								var body = req.body.html.replace("#fullname#",us[id][0]).replace("#lastname#",us[id][1]).replace("#totalpoints#",us[id][3].toFixed(9));								
								var callback=function(error, info){
									if(error==null) res.send({"success":"true","msg":"OK"});
									else res.send({"success":"false","msg":error});
								};
								if(i<recv.length-1) email(to,sub,body,null);
								else email(to,sub,body,callback);
							}
						}						
					});
				}				
			});
		}
	});
	return router;
}