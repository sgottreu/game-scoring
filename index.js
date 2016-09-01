var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');


var mongodb_config = (process.env.mongodb) ? process.env.mongodb : process.argv[2];
const db = monk('mongodb://'+mongodb_config);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/continental_divide.html');
});


io.on('connection', function(socket){
  console.log('client connected');

  socket.on('available_games', function(){
  	emitAvailableGames(io);
  });

  socket.on('disconnect', function(){
    console.log('client disconnected');
  });

  socket.on('save username', function(msg){
    console.log(msg);

    io.emit('save username', msg);
  });
  socket.on('update_company', function(msg){
    console.log(msg);

    io.emit('update_company', msg);
  });
});


function emitAvailableGames(io){
	var available_games = db.get('game-scoring--games');
  available_games.find({}).then(function(docs) {
		for(var x=0,len=docs.length;x<len;x++){
			docs[x].date = moment(docs[x]._id.getTimestamp()).format("MM/DD/YYYY");
		}
		console.log(docs);
  	io.emit('available_games', docs); 
  });
}


http.listen(3000, function(){
  console.log('listening on *:3000');
});