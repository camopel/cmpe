var express = require('express');
var router = express.Router();
module.exports =  function(db){
	// function generateRandomPassword()
	// {
		// var dict = "0123456789abcdefghijklmnopqrstuvwxyz";
		// var pass="";
		// for(var i=0;i<6;i++)
		// {
			// pass += dict.charAt(Math.floor((Math.random() * 36)));
		// }
		// return pass;
	// }
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
					password:"pswd",//generateRandomPassword(),
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
			// var result = {
				// "success":"false",
				// "msg":"Not login as admin. Redirect to Login Page after 3 seconds",
				// "redirectpage":"/view/login.html"
			// };
			// res.send(result);
			res.redirect("/view/login.html");
		}
		else{
			if (!req.files){res.send({"success":"false","msg":"No file uploaded"});}
			else{
				var file = req.files["upload_file"];	
				//console.log(file.mimetype); //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet		
				file.mv(req.app.locals.uploadDir+file.name, function(err){
					if (err!=null){res.send({"success":"false", "msg":err});}
					else{
						var XLSX = require('xlsx');
						var workbook = XLSX.readFile(req.app.locals.uploadDir+file.name);
						var first_sheet_name = workbook.SheetNames[0];
						var worksheet = workbook.Sheets[first_sheet_name];
						var A1 = worksheet['A1'];
						var A2 = worksheet['B1'];
						var A3 = worksheet['C1'];
						var A4 = worksheet['D1'];
						var A5 = worksheet['E1'];
						var A6 = worksheet['F1'];
						var A7 = worksheet['G1'];
						if(req.body.upload_for=="Faculty" && (A1==null || A2==null || A3==null || A4==null || A1.v!='sjsuid' || A2.v!='lastname' && A3.v!='firstname' && A4.v!='email')){
							res.send({"success":"false", "msg":"Header not match FACULTY format!"});
							return;
						}
						else if(req.body.upload_for=="Conversion" && (A1==null || A2==null || A3==null || A4==null || A1.v!='sjsuid' || A2.v!='semester' && A3.v!='conversion' && A4.v!='comment')){
							res.send({"success":"false", "msg":"Header not match CONVERSION format!"});
							return;
						}
						else if(req.body.upload_for=="Project" && (A1==null || A2==null || A3==null || A4==null || A5==null || A6==null|| A7==null|| A1.v!='sjsuid' || A2.v!='semester' && A3.v!='program' && A4.v!='industry advisor'  || A5.v!='student'  || A6.v!='project title' || A7.v!='points')){
							res.send({"success":"false", "msg":"Header not match PROJECT format!"});
							return;
						}
						//console.log(worksheet);
						var json = XLSX.utils.sheet_to_json(worksheet);
						//console.log(json);
						var map={
							"Faculty":{datatype:"user",collection:"users"},
							"Conversion":{datatype:"conv",collection:"conversions"},
							"Project":{datatype:"proj",collection:"projects"}
						}
						if(map[req.body.upload_for]!=null)
						{
							var ws = worksheetParse(map[req.body.upload_for].datatype,json);
							var coln = map[req.body.upload_for].collection;
							var collection = db.collection(coln);
							//console.log(coln);
							for(var i=0;i<ws.length;i++)
							{
								var filter = {};
								if(coln=="users") filter["sjsuid"]=ws[i].sjsuid;
								else if(coln=="conversions"){
									filter["sjsuid"]=ws[i].sjsuid;
									filter["semester"]=ws[i].semester;
								}
								else if(coln=="projects"){
									filter["sjsuid"]=ws[i].sjsuid;
									filter["semester"]=ws[i].semester;
									filter["student"]=ws[i].student;
								}
								collection.updateOne(filter, {$set:ws[i]},{upsert:true});//,function(err,r){console.log(r);}
								//collection.insertOne(ws[i]);								
							}
							res.send({ "success":"true", "msg":'Uploaded '+ws.length+' Records' });							
						}
						else{res.send({"success":"false","msg":'Wrong Parameter'});}
					}					
				});	
								
				
			}
		}
	});
	return router;	
}