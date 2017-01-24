var express = require('express');
var router = express.Router();
module.exports =  function(db){
	function parseSemester(s){
		var dict=["","Winter","Spring","Summer","Fall"];
		return (dict[s.charAt(3)]+" "+s.charAt(0)+"0"+s.substring(1,3));
	}
	function Workbook(){
		if(!(this instanceof Workbook)) return new Workbook();
		this.SheetNames = [];
		this.Sheets = {};
	}
	
	function generateXLSX(path,u,p,cv,s){
		var XLSX = require('xlsx');
		var wb = new Workbook();
		if(s!=null)
		{
			var ws = {};
			wb.SheetNames.push("Summary");
			ws[XLSX.utils.encode_cell({c:0,r:0})] = {v:"SJSUID",t:"s"};
			ws[XLSX.utils.encode_cell({c:1,r:0})] = {v:"Name",t:"s"};
			ws[XLSX.utils.encode_cell({c:2,r:0})] = {v:"Project Total Balance",t:"s"};
			
			var R=1;
			for(var sid in s){
				ws[XLSX.utils.encode_cell({c:0,r:R})] = {v:sid,t:"s"};
				ws[XLSX.utils.encode_cell({c:1,r:R})] = {v:u[sid],t:"s"};
				ws[XLSX.utils.encode_cell({c:2,r:R})] = {v:s[sid].toFixed(2),t:"s"};
				R++;		
			}
			
			var wscols = [{wch:15},{wch:30},{wch:20}];
			ws['!cols'] = wscols;
			var range = {s:{c:0,r:0}, e:{c:wscols.length-1, r: R-1}};
			ws['!ref'] = XLSX.utils.encode_range(range);
			wb.Sheets["Summary"] = ws;
		}
		if(p!=null){
			var ws = {};
			wb.SheetNames.push("Project");
			ws[XLSX.utils.encode_cell({c:0,r:0})] = {v:"SJSUID",t:"s"};
			ws[XLSX.utils.encode_cell({c:1,r:0})] = {v:"Name",t:"s"};
			ws[XLSX.utils.encode_cell({c:2,r:0})] = {v:"Semester",t:"s"};
			ws[XLSX.utils.encode_cell({c:3,r:0})] = {v:"Program",t:"s"};
			ws[XLSX.utils.encode_cell({c:4,r:0})] = {v:"Industry Advisor",t:"s"};
			ws[XLSX.utils.encode_cell({c:5,r:0})] = {v:"Student",t:"s"};
			ws[XLSX.utils.encode_cell({c:6,r:0})] = {v:"Project Title",t:"s"};
			ws[XLSX.utils.encode_cell({c:7,r:0})] = {v:"Points",t:"s"};
			
			
			for(var R=1;R<=p.length;R++){
				var obj = p[R-1];				 
				ws[XLSX.utils.encode_cell({c:0,r:R})] = {v:obj.sjsuid,t:"s"};
				ws[XLSX.utils.encode_cell({c:1,r:R})] = {v:obj.name,t:"s"};
				ws[XLSX.utils.encode_cell({c:2,r:R})] = {v:obj.semester,t:"s"};
				ws[XLSX.utils.encode_cell({c:3,r:R})] = {v:obj.program,t:"s"};
				ws[XLSX.utils.encode_cell({c:4,r:R})] = {v:obj.industry,t:"s"};
				ws[XLSX.utils.encode_cell({c:5,r:R})] = {v:obj.student,t:"s"};
				ws[XLSX.utils.encode_cell({c:6,r:R})] = {v:obj.project,t:"s"};
				ws[XLSX.utils.encode_cell({c:7,r:R})] = {v:obj.points,t:"s"};			
			}
			
			var wscols = [{wch:15},{wch:25},{wch:15},{wch:15},{wch:25},{wch:25},{wch:50},{wch:10}];
			ws['!cols'] = wscols;
			var range = {s:{c:0,r:0}, e:{c:wscols.length-1, r: p.length}};
			ws['!ref'] = XLSX.utils.encode_range(range);
			wb.Sheets["Project"] = ws;
		}
		if(cv!=null){
			var ws = {};
			wb.SheetNames.push("Conversion");
			
			ws[XLSX.utils.encode_cell({c:0,r:0})] = {v:"SJSUID",t:"s"};
			ws[XLSX.utils.encode_cell({c:1,r:0})] = {v:"Name",t:"s"};
			ws[XLSX.utils.encode_cell({c:2,r:0})] = {v:"Semester",t:"s"};
			ws[XLSX.utils.encode_cell({c:3,r:0})] = {v:"Conversion",t:"s"};
			ws[XLSX.utils.encode_cell({c:4,r:0})] = {v:"Comments",t:"s"};
			
			
			for(var R=1;R<=cv.length;R++){
				var obj = cv[R-1];
				ws[XLSX.utils.encode_cell({c:0,r:R})] = {v:obj.sjsuid,t:"s"};
				ws[XLSX.utils.encode_cell({c:1,r:R})] = {v:obj.name,t:"s"};
				ws[XLSX.utils.encode_cell({c:2,r:R})] = {v:obj.semester,t:"s"};
				ws[XLSX.utils.encode_cell({c:3,r:R})] = {v:obj.conv,t:"s"};
				ws[XLSX.utils.encode_cell({c:4,r:R})] = {v:obj.comment,t:"s"};	
			}
			
			var wscols = [{wch:15},{wch:30},{wch:15},{wch:15},{wch:50}];
			ws['!cols'] = wscols;
			var range = {s:{c:0,r:0}, e:{c:wscols.length-1, r: cv.length}};
			ws['!ref'] = XLSX.utils.encode_range(range);
			wb.Sheets["Conversion"] = ws;
		}		
		XLSX.writeFile(wb, path);
	}
	router.post('/', function(req, res, next) {
		if(!req.session || !req.session.login){res.redirect("/view/login.html");}
		else{
			if(!req.body.downloadFor){res.send("Error,Missing Parameters");}
			else
			{
				var users = {};
				var summary = {};
				var projects = [];
				var conventions = [];
				if(req.body.downloadFor=="admin"){
					db.collection('users').find({'role':'user'}).project({firstname:1,lastname:1,sjsuid:1}).toArray(function(err,us){
						if(err!=null) res.send("Error,"+err);
						else{							
							for(var i=0;i<us.length;i++){
								users[us[i].sjsuid]=us[i].firstname+","+us[i].lastname;							
							}							
							db.collection('conversions').find().toArray(function(err,convs){
								if(err!=null) res.send("Error,"+err);
								else{									
									for(var i=0;i<convs.length;i++)
									{	
										var row=convs[i];
										conventions.push({											
											"sjsuid":row.sjsuid,
											"name":users[row.sjsuid],
											"semester":parseSemester(row.semester),
											"conv":row.conversion,
											"comment":row.comment
										});
										if(summary[row.sjsuid]==null) summary[row.sjsuid]=0.0;
										summary[row.sjsuid]+=parseFloat(row.conversion);
									}

									db.collection('projects').find().toArray(function(err,projs){
										if(err!=null) res.send("Error,"+err);
										else{											
											for(var i=0;i<projs.length;i++)
											{	
												var row=projs[i];
												projects.push({
													"sjsuid":row.sjsuid,
													"name":users[row.sjsuid],
													"semester":parseSemester(row.semester),
													"program":row.program,
													"industry":row.industry_advisor,
													"student":row.student,
													"project":row.project,
													"points":row.points
												});
												if(summary[row.sjsuid]==null) summary[row.sjsuid]=0.0;
												summary[row.sjsuid]+=parseFloat(row.points);
											}
											var path = req.app.locals.uploadDir+req.body.downloadFor+".xlsx";
											generateXLSX(path,users,projects,conventions,summary);
											res.download(path);											
										}
									});
								}
							});
						}							
					});
				}
				else{
					var sjsuid = req.body.downloadFor;
					db.collection('users').find({'sjsuid':sjsuid}).project({firstname:1,lastname:1}).toArray(function(err,us){
						if(err!=null) res.send("Error,"+err);
						else{							
							for(var i=0;i<us.length;i++){
								users[sjsuid]=us[i].firstname+","+us[i].lastname;							
							}							
							db.collection('conversions').find({'sjsuid':sjsuid}).toArray(function(err,convs){
								if(err!=null) res.send("Error,"+err);
								else{									
									for(var i=0;i<convs.length;i++)
									{	
										var row=convs[i];
										conventions.push({											
											"sjsuid":row.sjsuid,
											"name":users[row.sjsuid],
											"semester":parseSemester(row.semester),
											"conv":row.conversion,
											"comment":row.comment
										});										
									}
									db.collection('projects').find({'sjsuid':sjsuid}).toArray(function(err,projs){
										if(err!=null) res.send("Error,"+err);
										else{											
											for(var i=0;i<projs.length;i++)
											{	
												var row=projs[i];
												projects.push({
													"sjsuid":row.sjsuid,
													"name":users[row.sjsuid],
													"semester":parseSemester(row.semester),
													"program":row.program,
													"industry":row.industry_advisor,
													"student":row.student,
													"project":row.project,
													"points":row.points
												});
											}
											var path = req.app.locals.uploadDir+sjsuid+".xlsx";
											generateXLSX(path,users,projects,conventions,null);
											res.download(path);											
										}
									});
								}
							});
						}							
					});
					
				}
				
			}
		}
	});
	return router;	
}