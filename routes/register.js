var express = require('express');
var router = express.Router();
module.exports =  function(db){
	router.post('/', function(req, res, next) {
		if(!req.body.LastName||!req.body.FirstName||!req.body.SJSUID||!req.body.EMail||!req.body.Password)
		{
			var result = {
				"success":"false",
				"msg":"Missing parameters"
			};
			res.send(result);
		}
		else{
			var collection = db.collection('users');
			collection.find({ $or: [ { 'sjsuid': req.body.SJSUID}, { 'email':req.body.EMail } ] }).toArray(function(err, data) {					
				if(data!=null&&data.length>0)
				{
					var result = {
						"success":"false",
						"msg": "SJSUID or Email exist!"
					};
					res.send(result);
				}
				else if(err==null)
				{					
					collection.insertOne({
						'sjsuid':req.body.SJSUID,
						'lastname':req.body.LastName,
						'firstname':req.body.FirstName,
						'email':req.body.EMail,
						'password':req.body.Password,
						'role':'user',
						'updatetime':new Date()
					}, function(err, r) {
						if(null==err && 1==r.insertedCount)
						{
							var result = {
								"success":"true",
								"msg":"Registry succeed! Redirect to login page after 3 seconds",
								"redirectpage":"/view/login.html"
							};
							res.send(result);
						}
						else
						{
							var result = {
								"success":"false",
								"msg":"Creation failed!"
							};
							res.send(result);
						}
					});
				}
			});				
		}
	});
	return router;
}