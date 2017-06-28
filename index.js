var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

var bodyParser = require('body-parser');
var db_collection = "game-scoring--games";

var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');

var morgan = require('morgan');
var dotenv = require('dotenv');

var mongodb_config = (process.env.mongodb) ? process.env.mongodb : process.argv[2];
mongodb_config = (!mongodb_config) ? dotenv['mongodb'] : mongodb_config;

var mongo_url = 'mongodb://'+mongodb_config;
var db = monk(mongo_url);

var nsp_socket = [];




var base_io = require('./src/index')(io);
var continental_divide_io = require('./src/continential_divide')(io, db);

app.use(morgan('combined'));



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

var port = process.env.PORT || '4000';
app.set('port', port);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/continental_divide', function(req, res){
  res.sendFile(__dirname + '/public/continental_divide/index.html');
});

app.get('/nautilus', function(req, res){
  res.sendFile(__dirname + '/public/nautilus.html');
});

app.get('/tesla', function(req, res){
  res.sendFile(__dirname + '/public/tesla.html');
});

app.get('/shipyard', function(req, res){
  res.sendFile(__dirname + '/public/shipyard.html');
});

app.get('/masters_of_venice', function(req, res){
  res.sendFile(__dirname + '/public/masters_of_venice/index.html');
});


http.listen(port, function(){
  console.log('listening on *:'+port);
});


exports.app = app; // for testing

