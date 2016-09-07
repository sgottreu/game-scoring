var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');


var mongodb_config = (process.env.mongodb) ? process.env.mongodb : process.argv[2];
var mongo_url = 'mongodb://'+mongodb_config;

const db = monk(mongo_url);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/continental_divide.html');
});


io.on('connection', function(socket){
  console.log('client connected');

  socket.on('add_game_instance', function(obj){
    addGameInstance(io, obj);
  });

  socket.on('join_game_instance', function(obj){
    joinGameInstance(io, obj);
  });

  socket.on('available_games', function(game){
  	emitAvailableGames(io, game);
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


function emitAvailableGames(io, game){
	var available_games = db.get('game-scoring--games');
  available_games.find({ name: game.name }).then(function(docs) {
    for(var x=0,len=docs.length;x<len;x++){
			docs[x].date = moment(docs[x]._id.getTimestamp()).format("MM/DD/YYYY");
      docs[x].selected = (game._id !== undefined && game._id.toString() == docs[x]._id.toString()) ? true : false;
		}
  	io.emit('available_games', docs); 
  });
}

function addGameInstance(io, obj){
  var available_games = db.get('game-scoring--games');

  available_games.insert({name: obj.game.name, users: [obj.user]}).then(function (data) {
    emitAvailableGames(io, data);
    io.emit('joined_game', data); 
  });
}

function joinGameInstance(io, obj){
  var available_games = db.get('game-scoring--games');

  available_games.find({ "_id" : monk.id(obj.game._id) }).then(function(game) {

    if(!game.users.includes(obj.user)){
      available_games.findOneAndUpdate( 
        { "_id" : monk.id(obj.game._id) },
        { $push: { users: obj.user } }
      ).then(function(docs) {
        console.log('Joining game');
        docs.date = moment(docs._id.getTimestamp()).format("MM/DD/YYYY");
        docs.selected = (obj.game._id !== undefined && obj.game._id.toString() == docs._id.toString()) ? true : false;
        io.emit('joined_game', docs); 
      });
    }
  });
}

  function calcDividend(company){
    var si = parseInt(company.stocks_issued);
    var ri = parseInt(company.rr_income);

    return Math.ceil( parseFloat(ri/si) );
  }

  function calcStockPrice(company){
    var sv = parseInt(company.stock_value);
    var dv = parseInt(company.dividend);

    return sv+dv;
  }

  function calcDividendPayment(company, stock_owned){
    var dv = parseInt(company.dividend);
    var so = parseInt(stock_owned);

    return so * dv ;
  }



http.listen(3000, function(){
  console.log('listening on *:3000');
});