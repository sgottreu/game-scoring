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

var nsp_socket = [];

const companies = ['blue','red', 'yellow', 'pink', 'green', 'brown', 'purple', 'black'];

const player_amts = {
    3: 80,
    4: 60,
    5: 48,
    6: 40 
  };

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

  socket.on('save username', function(username){
    createNamespace(username);
    io.emit('save username', username);
  });
  socket.on('update_company', function(obj){
    updateCompanyInfo(obj);
  });

  socket.on('get_company', function(obj){
    getCompanyInfo(obj);
  });

});

function createNamespace(username){
  nsp_socket[username] = io.of('/'+username);
  nsp_socket[username].on('connection', function(socket){
    console.log(username+' connected to nsp channel: '+username);

  });
}

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
  var game_obj = buildGameInstance(obj);

  available_games.insert( game_obj).then(function (data) {
    emitAvailableGames(io, data);
    data.newest_user = obj.user;
    io.emit('joined_game', data); 
  });
}

function joinGameInstance(io, obj){
  var available_games = db.get('game-scoring--games');

  console.log('Attempting to join game');

  available_games.find({ "_id" : monk.id(obj.game._id) }).then(function(game) {
    console.log('game found');
    if(game[0].users[ obj.user ] === undefined){

      var users = game[0].users;

      users[obj.user] = buildUserObj(obj.user);
      for(var x=0,len=companies.length;x<len;x++){
        users[obj.user].companies[ companies[x] ] = buildUserCompanyObj(companies[x]);
      }

      available_games.findOneAndUpdate( 
        { "_id" : monk.id(obj.game._id) },
        { $set: { users: users } }
      ).then(function(docs) {
        console.log('Joining game');
        docs.date = moment(docs._id.getTimestamp()).format("MM/DD/YYYY");
        docs.selected = (obj.game._id !== undefined && obj.game._id.toString() == docs._id.toString()) ? true : false;

        docs.newest_user = obj.user;
        io.emit('joined_game', docs); 
      });
    } else {
      console.log('Joining game already a part of');
      game[0].date = moment(game[0]._id.getTimestamp()).format("MM/DD/YYYY");
      game[0].selected = (obj.game._id !== undefined && obj.game._id.toString() == game[0]._id.toString()) ? true : false;
      game[0].newest_user = obj.user;
      io.emit('joined_game', game[0]); 
    }
  });
}

function getCompanyInfo(obj){
  var available_games = db.get('game-scoring--games');
  console.log('Getting company');

  available_games.find({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
    io.emit('get_company', game[0].companies[obj.company_name]); 
  });
}

function updateCompanyInfo(obj){
  var avail_game = db.get('game-scoring--games');
  console.log('updating company');

  avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
    console.log('Found game company to update');
    var curr_compy = calcCompanyValues(obj.company, db_game.companies[ obj.company.tag ]);

    db_game.companies[ obj.company.tag ] = curr_compy;

    avail_game.update(
      { "_id" : monk.id(obj.game_oid) }, 
      db_game )
    .then(function(game){
      console.log('Company updated');
      io.emit('update_company', curr_compy);
    });
  });
}

  function calcDividend(stocks_issued, rr_income){
    var si = parseInt(stocks_issued);
    var ri = parseInt(rr_income);

    return isNaN( parseFloat(ri/si) ) ? 0 : Math.ceil( parseFloat(ri/si) );
  }

  function calcStockPrice(stock_value, dividend){
    var sv = parseInt(stock_value);
    var dv = parseInt(dividend);

    return sv+dv;
  }

  function calcDividendPayment(dividend, stock_owned){
    var dv = parseInt(dividend);
    var so = parseInt(stock_owned);

    return so * dv ;
  }

function buildGameInstance(obj){
  var comp, user = {};

  user[obj.user] = buildUserObj(obj.user);

  var game_obj = {
    name: obj.game.name, 
    users: user,
    companies: {}
  };

  for(var x=0,len=companies.length;x<len;x++){
    comp = companies[x];
    game_obj.companies[ comp ] = buildCompanyObj(comp);
    game_obj.users[obj.user].companies[ comp ] = buildUserCompanyObj(comp);
  }

  return game_obj;
}


function buildCompanyObj(comp){
  return {
    tag: comp,
    name: comp+' Railroad',
    stocks_issued: 0,
    rr_income: 0,
    stock_value: 0,
    stock_price: 0,
    dividend: 0,
    remaining_stock: 0
  };
}

function buildUserObj(user){
  return {
    name: user,
    companies: {},
    cash_total: 0,
    dividend_payment: 0
  };
}

function buildUserCompanyObj(comp){
  return {
    tag: comp,
    name: comp+' Railroad',
    stocks_owned: 0,
    dividend: 0
  };
}

function calcCompanyValues(obj, db_game){
  if(db_game.stocks_issued == 0){
    db_game.stocks_issued = obj.stocks_issued;
    db_game.stock_value   = obj.stock_value;
  }
  db_game.rr_income   = obj.rr_income;
  db_game.dividend    = calcDividend(db_game.stocks_issued, db_game.rr_income);
  db_game.stock_price = calcStockPrice(db_game.stock_value, db_game.dividend);

  return db_game;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});