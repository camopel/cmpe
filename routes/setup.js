var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

module.exports = router.get('/', function(req, res, next) {
	MongoClient.connect(req.app.locals.dburl, function(err, db){
		if(err!=null) res.send({"success":"false","msg":err});
		else{			
			db.createCollection("users");		
			db.collection("users").insertOne({sjsuid:"admin",password:"cmpeadmin",role:"admin",email:"adm.cmpe.sjsu@gmail.com",lastname:"cmpe",firstname:"admin",updatetime:new Date()});
			db.collection("users").createIndex({sjsuid:1},{unique:true, background:true});
			
			db.createCollection("conversions");
			db.collection("conversions").createIndex({sjsuid:1},{unique:false});
			db.collection("conversions").createIndex({semester:1},{unique:false});
			
			db.createCollection("projects");
			db.collection("projects").createIndex({sjsuid:1},{unique:false, background:true});
			db.collection("projects").createIndex({semester:1},{unique:false, background:true});
			db.close();
			res.send("OK");
		}
	});
});