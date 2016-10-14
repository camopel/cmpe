var express = require('express');
var router = express.Router();
module.exports =  function(db){
	router.get('/', function(req, res, next) {		
		if(!req.session || !req.session.login || req.session.sjsuid!=req.query.id)
		{
			var result = {
				"success":"false",
				"msg":"Not login as admin. Redirect to Login Page after 3 seconds",
				"redirectpage":"/view/login.html"				
			};
			res.send(result);
		}
		else if(req.query.id!=null&&req.query.id!=""){
			var id = req.query.id;
			if(req.query.cmd=="show"){				
				var rst = {};
				db.collection('users').findOne({'sjsuid':id},{'lastname':1,'firstname':1,'email':1,'sjsuid':1},function(err,me){
					if(err!=null) res.send({"success":"false","msg":err});
					else{
						rst["info"]=me;
						db.collection('projects').find({"sjsuid":id}).toArray(function(err,proj){
							if(err!=null) res.send({"success":"false","msg":err});
							else{
								rst["proj"]=proj;
								db.collection('conversions').find({"sjsuid":id}).toArray(function(err,conv){
									if(err!=null) res.send({"success":"false","msg":err});
									else{
										rst["conv"]=conv;
										rst["success"]="true"
										res.send(rst);
									}
									
								});		
							}											
						});
					}					
				});
			}
			else if(req.query.cmd=="update"){
				var u = {
					"email":req.query.email,
					"lastname":req.query.lastname,
					"firstname":req.query.firstname,
					"updatetime":new Date()
				};
				if(req.query.password!="000000") u.password = req.query.password;
				db.collection('users').updateOne({"sjsuid":id},{$set:u},{},function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});					
				});
			}			
		}
	});
	return router;
}

