var express = require('express');
var router = express.Router();
module.exports =  function(db){
	router.post('/', function(req, res, next) {		
		if(!req.body.sjsueml||!req.body.password){
			var result = {"success":"false","msg":"Missing parameters"};
			res.send(result);
		}
		else{
			if(req.body.sjsueml=="admin"){
				var collection = db.collection('users');
				collection.findOne({'sjsuid': req.body.sjsueml,'password':req.body.password},{fields:{'role':1,'sjsuid':1}}, function(err, data) {
					if(data==null){res.send({"success":"false","msg":"Password not right!"});}
					else{
						req.session.role = data.role;
						req.session.login = true;
						req.session.sjsuid = data.sjsuid;
						res.cookie('sjsuid',data.sjsuid);
						res.send({"success":"true","msg":"Login succeed","redirectpage":"/view/content.html"});
					}
				});
			}
			else{
				var ldap = require('ldapjs');
				var client = ldap.createClient({url: 'ldap://its-cadc001ldap.sjsuad.sjsu.edu'});
				client.bind(req.body.sjsueml,req.body.password, function(err){
					if(err){res.send({"success":"false","msg":"Login Fail, Wrong Password or SJSU email!"});}
					else{
						var opts = {
						  filter: '(mail='+req.body.sjsueml+')',
						  scope: 'sub',
						  attributes:['sn','givenName','sAMAccountName','mail']
						};
						client.search('OU=sjsuPeople,DC=SJSUAD,DC=SJSU,DC=EDU',opts,function(err, data){
								if(err){res.send({"success":"false","msg":"Service fail!"});}
								else{
									data.on('searchEntry', function(entry){
									//console.log('entry:'+JSON.stringify(entry.object));
									//console.log(entry.object.sn+","+entry.object.givenName+","+entry.object.mail+","+entry.object.sAMAccountName);
										var collection = db.collection('users');
										collection.updateOne({"email":req.body.sjsueml},{$set:{
											"email":entry.object.mail,
											"lastname":entry.object.sn,
											"firstname":entry.object.givenName,
											"sjsuid":entry.object.sAMAccountName,
											"role":"user",
											"password":req.body.password,
											"updatetime":new Date()}},{upsert:true},
										function(err,r){
											//if(err){console.log("update err:"+JSON.stringify(err));}
											req.session.role = "user";
											req.session.login = true;
											req.session.sjsuid = entry.object.sAMAccountName;
											res.cookie('sjsuid',entry.object.sAMAccountName);
											res.send({"success":"true","msg":"Login succeed","redirectpage":"/view/index.html"});
										});
									});
									//res.on('end', function(){res.send({"success":"true","msg":"Login succeed","redirectpage":"/view/index.html"});});
								}
							});
					}
				});
			}
		}
	});
	router.get('/test', function(req, res, next) {
		if(!req.session || !req.session.login || !req.session.role=="admin" || !req.session.sjsuid=="admin")
		{
			res.send({"redirectpage":"/view/login.html"});
		}
		else res.send({});
	});
	return router;
}

