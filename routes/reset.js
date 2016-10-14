var express = require('express');
var router = express.Router();
module.exports =  function(db){
	router.post('/', function(req, res, next) {
		if(!req.body.SJSUID)
		{
			var result = {
				"success":"false",
				"msg":"Missing parameters"
			};
			res.send(result);
		}
		else{
			var collection = db.collection('users');
			collection.findOne({'sjsuid': req.body.SJSUID},{fields:{'email':1,'password':1}},function(err, data) {					
				if(data==null)
				{
					var result = {
						"success":"false",
						"msg": "Could not recognize your SJSUID!"
					};
					res.send(result);
				}
				else
				{
					var email = require('./smtp.js');
					var sub = 'Password Retrive';
					var body = '<span>Your password is <strong>'+data.password+'</strong></span>';
					email(data.email,sub,body,function(error, info){
						if(error){
							var result = {
								"success":"false",
								"msg":"Send email failed!"
							};
							res.send(result);
						}
						else
						{
							console.log('Message sent:' + info.response);
							var result = {
								"success":"true",
								"msg":"Your password is sent to your email box. Redirect to login page after 3 seconds",
								"redirectpage":"/view/login.html"
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