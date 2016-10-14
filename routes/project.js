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
				db.collection('projects').find().toArray(function(err,projs){
					if(err!=null) res.send({"success":"false","msg":err});
					else{
						var list = [];
						for(var i=0;i<projs.length;i++)
						{	
							var row=projs[i];
							list.push({
								"id":row._id,
								"sjsuid":row.sjsuid,							
								"semester":row.semester,
								"program":row.program,
								"industry":row.industry_advisor,
								"student":row.student,
								"code":row.code,
								"project":row.project,
								"points":row.points
							});
						}
						db.collection('users').find({'role':'user'}).toArray(function(err,us){
							if(err!=null) res.send({"success":"false","msg":err});
							else{
								var users = {};
								for(var i=0;i<us.length;i++){
									users[us[i].sjsuid]=us[i].lastname+" "+us[i].firstname;							
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
				db.collection('projects').updateOne({"_id":new ObjectID(req.query.pd_id)}, {$set:{
					"sjsuid":req.query.pd_sjsuid,
					"semester":req.query.pd_year+req.query.pd_season,					
					"program":req.query.pd_program,
					"industry_advisor":req.query.pd_industry,
					"student":req.query.pd_student,
					"code":req.query.pd_code,
					"project":req.query.pd_project,
					"points":req.query.pd_points,
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
				var item = {
					sjsuid:req.query.pd_sjsuid.trim(),
					semester:req.query.pd_year+req.query.pd_season,
					program:req.query.pd_program.trim(),
					industry_advisor:req.query.pd_industry.trim(),					
					student:req.query.pd_student.trim()==""?"N/A":req.query.pd_student.trim(),
					code:req.query.pd_code.trim(),
					project:req.query.pd_project.trim()==""?"N/A":req.query.pd_project.trim(),
					points:req.query.pd_points.trim()==""?"0":req.query.pd_points.trim()
				};
				db.collection('projects').insertOne(item,function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});
				});
			}
			else if(req.query.cmd=="del"){
				var ObjectID = require('mongodb').ObjectID;
				db.collection('projects').removeOne({"_id":new ObjectID(req.query.id)},{w:1},function(err, r){
					if(err!=null) res.send({"success":"false","msg":err});
					else res.send({"success":"true"});
				});
			}
		}
	});
	return router;
}

