var express = require('express');
var router = express.Router();
module.exports =  function(db){
	router.post('/', function(req, res, next) {		
		if(!req.body.sjsuid||!req.body.password)
		{
			var result = {
				"success":"false",
				"msg":"Missing parameters"			
			};
			res.send(result);
		}
		else{		
			var collection = db.collection('users');
			collection.findOne({'sjsuid': req.body.sjsuid,'password':req.body.password},{fields:{'role':1}}, function(err, data) {
				if(data==null)
				{
					var result = {
						"success":"false",
						"msg":"Password not right or user not exist!"
					};
					res.send(result);
				}
				else{
					req.session.role = data.role;
					req.session.login = true;
					req.session.sjsuid = req.body.sjsuid;
					res.cookie('sjsuid',req.body.sjsuid);
					var result = {
						"success":"true",
						"msg":"Login succeed",
						"redirectpage":data.role=="admin"?"/view/content.html":"/view/index.html"
					};
					res.send(result);
				}
			});
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

