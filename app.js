var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fupload = require('express-fileupload');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fupload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'cpme',
	name:'sessionid',
    resave: true,
    saveUninitialized: true
}));

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
app.locals={
	port:'8123',
	dburl:'mongodb://user:password@ip:port/db',
	uploadDir:path.join(__dirname, 'upload/')
};

MongoClient.connect(app.locals.dburl, function(err, db){
	assert.equal(null, err);
	console.log("Connected successfully to database server");	
	var _index = require('./routes/index');
	app.use('/', _index);
	var _login = require('./routes/login');
	app.use('/login', _login(db));
	var _register = require('./routes/register');
	app.use('/register', _register(db));
	var _reset = require('./routes/reset');
	app.use('/reset', _reset(db));
	var _faculty = require('./routes/faculty');
	app.use('/faculty', _faculty(db));
	var _upload = require('./routes/upload');
	app.use('/upload', _upload(db));
	var _conv = require('./routes/conversion');
	app.use('/conv', _conv(db));
	var _proj = require('./routes/project');
	app.use('/proj', _proj(db));
	var _eml = require('./routes/email');
	app.use('/eml', _eml(db));
	var _user = require('./routes/user');
	app.use('/user', _user(db));
});

var http = require('http');
var server = http.createServer(app);
server.listen(app.locals.port,function () {
	console.log('app listening on port %s!',app.locals.port);
});
