var express = require('express');
var app = express();
var path = require("path");
app.use(express.static(path.join(__dirname, 'public')));
var bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dburl = 'mongodb://localhost:27017/cmpe';
///////////////////
/////Session///////
///////////////////
var session = require('express-session');
app.use(session({
    secret: 'cpme sjsu',
	name:'sessionid',
    resave: true,
    saveUninitialized: true
}));

var auth = function(req, res, next) {
  if (req.session && req.session.login) return next();    
  else return res.redirect('/login.html');
};

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.clearCookie('sjsuid');
  res.redirect('/login.html');
});

app.get('/projects.html', auth, function (req, res) {
    res.sendfile(path.join(__dirname, '/public/projects.html'));
});

//////////////
////Login/////
//////////////
app.get('/', function (req, res) {
	res.redirect('/login.html');	
});
app.post('/login', function (req, res) {	
	if(!req.body.sjsuid||!req.body.password)
	{
		var result = {
			"success":"false",
			"msg":"Missing parameters"			
		};
		res.send(result);
	}
	else{
		MongoClient.connect(dburl, function(err, db) {
			if(err!=null)
			{
				var result = {
					"success":"false",
					"msg":"Can not connection database!"
				};
				res.send(result);
			}
			else{
				console.log("Connected successfully to server");
				var collection = db.collection('users');
				collection.findOne({'sjsuid': req.body.sjsuid,'password':req.body.password},{fields:{'role':1}}, function(err, data) {
					assert.equal(null, err);
					if(data==null)
					{
						var result = {
							"success":"false",
							"msg":"User not exist!"
						};
						res.send(result);
					}
					else{
						//req.session.sjsuid = req.body.sjsuid;
						req.session.role = data.role;
						req.session.login = true;
						res.cookie('sjsuid',req.body.sjsuid);
						//res.cookie('role',data.role);//admin,user
						var result = {
							"success":"true",
							"msg":"Login succeed",
							"redirectpage":"/projects.html"
						};
						res.send(result);
					}
				});	
			}				
			db.close();
		});
	}
});
//////////////
////Register/////
//////////////
app.get('/register', function (req, res) {
	if(!req.body.LastName||!req.body.FirstName||!req.body.SJSUID||!req.body.EMail||!req.body.Password)
	{
		var result = {
			"success":"false",
			"msg":"Missing parameters"
		};
		res.send(result);
	}
	else{
		MongoClient.connect(dburl, function(err, db) {
			if(err!=null)
			{
				var result = {
					"success":"false",
					"msg":"Can not connection database!"
				};
				res.send(result);
			}
			else{
				console.log("Connected successfully to server");
				collection.find({ $or: [ { 'sjsuid': req.body.SJSUID}, { 'email':req.body.EMail } ] }).toArray(function(err, data) {
					assert.equal(null, err);
					if(data!=null)
					{
						var result = {
							"success":"false",
							"msg":"SJSUID or Email exist!"
						};
						res.send(result);
					}
					else
					{
						var collection = db.collection('users');
						collection.insertOne({
							'sjsuid':req.body.SJSUID,
							'lastname':req.body.LastName,
							'firstname':req.body.FirstName,
							'email':req.body.EMail,
							'password':req.body.Password,
							'updatetime':new Date()
						}, function(err, r) {
						if(null==err && 1==r.insertedCount)
						{
							var result = {
								"success":"true",
								"msg":"User signUp succeed!",
								"redirectpage":"/login.html"								
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
					}
				});				
			}				
			db.close();
		});
	}
});

app.get('/reset', function (req, res) {
	res.send("reset");
});

app.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});