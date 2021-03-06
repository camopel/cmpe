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
	port:'8443',
	dburl:'mongodb://cmpeadmin:cmpe12#$@130.65.159.30:27017/cmpe',
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
	var _dld = require('./routes/download');
	app.use('/dld', _dld(db));	
});


const https = require('https');
const fs = require('fs');
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(app.locals.port,function(){
	console.log('app listening on port %s!',app.locals.port);
});
