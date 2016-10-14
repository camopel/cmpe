var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
module.exports = router.get('/', function(req, res, next) {
	MongoClient.connect(req.app.locals.dburl, function(err, db){
		db.collection('users').findOne({'role':'admin'},{fields:{'sjsuid':1}},function(err,data){
			db.listCollections().toArray(function(err, items){
				db.close();
				res.send({collections:items,admin:data.sjsuid});				
			});
		});
	});	
});