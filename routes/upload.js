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
	function worksheetParse(dataType,rows)
	{
		var ws = [];
		if(dataType=="user")
		{
			for(var i=0;i<rows.length;i++)
			{
				var item = rows[i];
				ws.push({
					sjsuid:item.sjsuid.trim(),
					lastname:item.lastname.trim(),
					firstname:item.firstname.trim(),
					email:item.email!=null?item.email.trim():"",
					password:generateRandomPassword(),
					role:'user',
					updatetime:new Date()
				});
			}
		}
		else if(dataType=="conv")
		{
			for(var i=0;i<rows.length;i++)
			{
				var item = rows[i];
				ws.push({
					sjsuid:item.sjsuid.trim(),
					semester:item.semester.trim(),
					conversion:item.conversion.trim(),			
					comment:item.comment!=null?item.comment.trim():"",
					updatetime:new Date()
				});
			}
		}
		else if(dataType=="proj")
		{
			for(var i=0;i<rows.length;i++)
			{
				var item = rows[i];			
				ws.push({
					sjsuid:item.sjsuid.trim(),
					semester:item.semester.trim(),
					program:item.program.trim(),
					industry_advisor:item["industry advisor"]!=null?item["industry advisor"].trim():"",					
					student:item.student.replace(","," ").trim(),
					project:item["project title"]!=null?item["project title"].trim():ws[ws.length-1]["project"],
					points:item.points.trim()
				});
			}
		}		
		return ws;
	}
	
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
			if (!req.files){
				var result = {
					"success":"false",
					"msg":"No file uploaded"
				};
				res.send(result);
			}
			else
			{
				var file = req.files["upload_file[]"];
				file.mv(req.app.locals.uploadDir+file.name, function(err){
					if (err!=null){
						var result = {
							"success":"false",
							"msg":err
						};
						res.send(result);
					}
					else {
						var XLSX = require('xlsx');
						var workbook = XLSX.readFile(req.app.locals.uploadDir+file.name);
						var first_sheet_name = workbook.SheetNames[0];
						var worksheet = workbook.Sheets[first_sheet_name];
						var json = XLSX.utils.sheet_to_json(worksheet);
						var map={
							"Faculty":{datatype:"user",collection:"users"},
							"Conversion":{datatype:"conv",collection:"conversions"},
							"Project":{datatype:"proj",collection:"projects"}
						}
						if(map[req.body.upload_for]!=null)
						{
							var ws = worksheetParse(map[req.body.upload_for].datatype,json);
							var collection = db.collection(map[req.body.upload_for].collection);
							for(var i=0;i<ws.length;i++)
							{								
								collection.insertOne(ws[i]);								
							}
							res.send({
								"success":"true",
								"msg":'Uploaded '+ws.length+' Records'
							});							
						}
						else{
							res.send({
								"success":"false",
								"msg":'Wrong Parameter'
							});
						}
					}					
				});	
			}
		}
	});
	return router;	
}