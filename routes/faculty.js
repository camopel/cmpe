var express = require('express');
var router = express.Router();
module.exports =  function(db){
	function generateRandomPassword()
	{
		var dict = "0123456789abcdefghijklmnopqrstuvwxyz";
		var pass="";
		for(var i=0;i<6;i++)
		{
			pass += dict.charAt(Math.floor((Math.random() * 36)));
		}
		return pass;
	}
	router.get('/', function(req, res, next) {		
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
			if(req.query.cmd=="show")
			{
				var collection = db.collection('users');
				collection.find({'role':'user'}).toArray(function(err,data){
					if(err!=null) res.send({"success":"false","msg":err});
					else{
						var list = [];
						for(var i=0;i<data.length;i++)
						{	
							var row=data[i];
							list.push({
								"id":row._id,
								"sid":row.sjsuid,
								"lastname":row.lastname,
								"firstname":row.firstname,
								"email":row.email								
							});
						}
						var result = {
							"success":"true",
							"msg":"",
							"data":list
						};
						res.send(result);
					}
				});
			}
			else if(req.query.cmd=="update")
			{
				var ObjectID = require('mongodb').ObjectID;
				var collection = db.collection('users');
				collection.updateOne({"_id":new ObjectID(req.query.fd_id)}, {$set:{
					"email":req.query.fd_email,
					"lastname":req.query.fd_lastname,
					"firstname":req.query.fd_firstname,
					"sjsuid":req.query.fd_sjsuid,
					"updatetime":new Date()
				}},{},function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else{
						res.send({
							"success":"true",
							"msg":"success"
						});
					}
				});
			}
			else if(req.query.cmd=="maillist")
			{
				var collection = db.collection('users');
				collection.find({'role':'user'}).toArray(function(err,data){
					if(err!=null) res.send({"success":"false","msg":err});
					else{						
						var list = {};
						for(var i=0;i<data.length;i++)
						{	
							var row=data[i];
							if(row.email!="") list[row.lastname+" "+row.firstname]=row.sjsuid;
						}
						res.send({
							"success":"true",
							"data":list
						});						
					}
				});
			}
			else if(req.query.cmd=="add"){
				var item = {
					sjsuid:req.query.fd_sjsuid.trim(),
					lastname:req.query.fd_lastname.trim(),
					firstname:req.query.fd_firstname.trim(),
					email:req.query.fd_email.trim(),
					password:generateRandomPassword(),
					role:'user',
					updatetime:new Date()
				};
				db.collection('users').insertOne(item,function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});
				});
			}
			else if(req.query.cmd=="del"){
				var ObjectID = require('mongodb').ObjectID;
				db.collection('users').removeOne({"_id":new ObjectID(req.query.id)},{w:1},function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});
				});
			}
		}
	});
	return router;
}