var express = require('express');
var router = express.Router();
module.exports =  function(db){
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
				db.collection('conversions').find().toArray(function(err,convs){
					if(err!=null) res.send({"success":"false","msg":err});
					else{
						var list = [];
						for(var i=0;i<convs.length;i++)
						{	
							var row=convs[i];
							list.push({
								"id":row._id,
								"sjsuid":row.sjsuid,							
								"semester":row.semester,
								"conv":row.conversion,
								"comment":row.comment
							});
						}
						db.collection('users').find({'role':'user'}).toArray(function(err,us){
							if(err!=null) res.send({"success":"false","msg":err});
							else{
								var users = {};
								for(var i=0;i<us.length;i++){
									users[us[i].sjsuid]=us[i].firstname+","+us[i].lastname;							
								}
								for(var i=0;i<list.length;i++){
									list[i]["name"] = users[list[i].sjsuid];
								}
								var result = {
									"success":"true",
									"data":list,
									"users":users
								};
								res.send(result);	
							}												
						});	
					}									
				});				
			}
			else if(req.query.cmd=="update")
			{
				var ObjectID = require('mongodb').ObjectID;
				db.collection('conversions').updateOne({"_id":new ObjectID(req.query.cd_id)}, {$set:{
					"semester":req.query.cd_year+req.query.cd_season,
					"sjsuid":req.query.cd_sjsuid,
					"conversion":req.query.cd_conv,
					"comment":req.query.cd_comment,
					"updatetime":new Date()
				}},{},function(err, result){
					if(err!=null) res.send({"success":"false","msg":err});
					else{
						var result = {
							"success":"true",
							"msg":"success"
						};
						res.send(result);
					}					
				});
			}
			else if(req.query.cmd=="add"){
				var ObjectID = require('mongodb').ObjectID;
				var item = {
					_id:new ObjectID(),
					sjsuid:req.query.cd_sjsuid.trim(),
					semester:req.query.cd_year+req.query.cd_season,
					conversion:req.query.cd_conv.trim(),			
					comment:req.query.cd_comment.trim(),
					updatetime:new Date()
				};
				db.collection('conversions').insertOne(item,function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});
				});
			}
			else if(req.query.cmd=="del"){
				var ObjectID = require('mongodb').ObjectID;
				db.collection('conversions').removeOne({"_id":new ObjectID(req.query.id)},{w:1},function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});
				});
			}
		}
	});
	return router;
}