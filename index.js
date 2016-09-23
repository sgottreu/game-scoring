var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

var mongo = require('mongodb');
var monk = require('monk');
var moment = require('moment');

var mongodb_config = (process.env.mongodb) ? process.env.mongodb : process.argv[2];
var mongo_url = 'mongodb://'+mongodb_config;

var db = monk(mongo_url);

var nsp_socket = [];

var companies = ['blue','red', 'yellow', 'pink', 'green', 'brown', 'purple', 'black'];

var player_amts = {
    3: 80,
    4: 60,
    5: 48,
    6: 40 
  };

var port = process.env.PORT || '3000';
app.set('port', port);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/continental_divide.html');
});

io.on('connection', function(socket){
  console.log('client connected');

  socket.on('disconnect', function(){
    console.log('client disconnected');
  });

  socket.on('add_game_instance', function(obj){
    addGameInstance(io, obj);
  });

  socket.on('join_game_instance', function(obj){
    joinGameInstance(io, obj);
  });

  socket.on('available_games', function(game){
  	emitAvailableGames(io, game);
  });

  socket.on('save username', function(username){
    createNamespace(username);
    io.emit('save username', username);
  });

  socket.on('update_company', function(obj){
    purchaseTransaction(obj);
  });

  socket.on('get_company', function(obj){
    getCompanyInfo(obj);
  });

  socket.on('get_stock_values', function(obj){
    getStockValues(obj);
  });

  socket.on('get_company_dividends', function(obj){
    getCompanyDividends(obj);
  });

  socket.on('update_company_treasury', function(obj){
    saveCompanyDividends(obj);
  });

  socket.on('modify_railroad_income', function(obj){
    updateRailroadIncome(obj);
  });

  socket.on('get_player_totals', function(obj){
    getPlayerTotals(obj);
  });

  socket.on('get_player_dividends', function(obj){
    getPlayerDividends(obj);
  });

  socket.on('update_player_treasury', function(obj){
    savePlayerDividends(obj);
  });



});

http.listen(port, function(){
  console.log('listening on *:'+port);
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
			docs[x] = setGameAttrib(docs[x], game._id);
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

  available_games.findOne({ "_id" : monk.id(obj.game._id) }).then(function(game) {
    console.log('game found');
    if(game.users[ obj.user ] === undefined){
      game.users = buildNewUserInstance(obj, game);

      available_games.findOneAndUpdate( 
        { "_id" : monk.id(obj.game._id) },
        game
      ).then(function(docs) {
        console.log('Joining game');
        docs = setGameAttrib(docs, obj.game._id, obj.user);
        io.emit('joined_game', docs); 
      });
    } else {
      console.log('Joining game already a part of');
      game = setGameAttrib(game, obj.game._id, obj.user);
      io.emit('joined_game', game); 
    }
  });
}

function buildNewUserInstance(obj, game){
  var users = game.users;

  users[obj.user] = buildUserObj(obj.user, game.num_players);
  for(var x=0,len=companies.length;x<len;x++){
    users[obj.user].companies[ companies[x] ] = buildUserCompanyObj(companies[x]);
  }
  return users;
}

function getStockValues(obj){
  var available_games = db.get('game-scoring--games');
  console.log('Getting Stock Values');
  available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
    io.emit('get_stock_values', {
      companies: game.companies, 
      purchase: obj.purchase,
      user_treasury: game.users[obj.user].cash_total
    }); 
  });
}

function getCompanyDividends(obj){
  var dividend_payment = {};
  var available_games = db.get('game-scoring--games');
  console.log('Getting Company Dividends');
  available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
    var curr_company;
    for(var x=0,len=companies.length;x<len;x++){
      curr_company = game.companies[ companies[x] ];
      dividend_payment[ companies[x] ] = {
        name: curr_company.name,
        dividend_payment: calcDividendPayment(curr_company.dividend, curr_company.remaining_stock)
      };
    }
    io.emit('get_company_dividends', dividend_payment ); 
  });
}

function saveCompanyDividends(obj){
  var available_games = db.get('game-scoring--games');
  console.log('Saving Company Dividends');
  available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
    var cc, treasury;
    for(var x=0,len=companies.length;x<len;x++){
      cc = game.companies[ companies[x] ];
      treasury = game.companies[ companies[x] ].rr_treasury;
      game.companies[ companies[x] ].rr_treasury = treasury + calcDividendPayment(cc.dividend, cc.remaining_stock);
    }

    available_games.update( { "_id" : monk.id(obj.game_oid) }, game )
      .then(function(upd_game){
        console.log('Company treasury updated');
        io.emit('update_company_treasury', true ); 
        nsp_socket[obj.user].emit('close_company_dividend_window', true);
    });

    io.emit('update_company_treasury', dividend_payment ); 
  });
}

function savePlayerDividends(obj){
  var available_games = db.get('game-scoring--games');
  console.log('Saving Player Dividends');
  available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
console.log(game.users);
    for (var u in game.users) {
console.log(u);
      if (game.users.hasOwnProperty(u)) {
console.log(calcPlayerDividend(game.users[u], game.companies, true));
        game.users[u].cash_total += calcPlayerDividend(game.users[u], game.companies, true);
      }
    }

    available_games.update( { "_id" : monk.id(obj.game_oid) }, game )
      .then(function(upd_game){
        console.log('Player treasuries updated');
        nsp_socket[obj.user].emit('close_player_dividend_window', true);
    });
  });
}

function setGameAttrib(game, _id, user){
  game.date = moment(game._id.getTimestamp()).format("MM/DD/YYYY");
  game.selected = (_id !== undefined && _id.toString() == game._id.toString()) ? true : false;
  if(user !== undefined){
    game.newest_user = user;
  }
  return game;
}

function getCompanyInfo(obj){
  var available_games = db.get('game-scoring--games');
  console.log('Getting company');

  available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
    io.emit('get_company', game.companies[obj.company_name]); 
  });
}

function purchaseTransaction(obj){
  var avail_game = db.get('game-scoring--games');
  console.log('updating company');

  avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
    console.log('Found game company to update');
    db_game.companies[ obj.company.tag ] = calcCompanyValues(obj, db_game);

    db_game.users[obj.user] = userTransaction(obj, db_game);

    avail_game.update(
      { "_id" : monk.id(obj.game_oid) }, 
      db_game )
    .then(function(game){
      console.log('Company updated');
      io.emit('update_company', db_game.companies[ obj.company.tag ]);

      nsp_socket[obj.user].emit('close_purchase_window', true);
    });
  });
}

function updateRailroadIncome(obj){
  var avail_game = db.get('game-scoring--games');
  console.log('updating income');

  avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
    console.log('Found game company to update');
    db_game.companies[ obj.company.tag ] = calcCompanyValues(obj, db_game);

    avail_game.update(
      { "_id" : monk.id(obj.game_oid) }, 
      db_game )
    .then(function(game){
      console.log('Company updated');
      io.emit('update_company', db_game.companies[ obj.company.tag ]);

      nsp_socket[obj.user].emit('close_income_window', true);
    });
  }); 
}

function getPlayerTotals(obj){
  var avail_game = db.get('game-scoring--games');
  console.log('get player totals');

  avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
    console.log('Found game ');

    var totals = calcPlayerDividend(db_game.users[obj.user], db_game.companies);

    nsp_socket[obj.user].emit('get_player_totals', totals);

  }); 
}

function getPlayerDividends(obj){
  var avail_game = db.get('game-scoring--games');
  console.log('get player dividends');

  avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
    console.log('Found game ');

    var users = {};

    for (var user in db_game.users) {
      if (db_game.users.hasOwnProperty(user)) {
        users[user] = calcPlayerDividend(db_game.users[user], db_game.companies);
        users[user].tag = db_game.users[user].tag;
      }
    }

    nsp_socket[obj.user].emit('get_player_dividends', users);

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

  function calcPlayerDividend(user, railroads, onlyDividend){
    onlyDividend = (onlyDividend === undefined) ? false : onlyDividend;
    var dividend_payment = 0;
    var totals = {user_treasury: user.cash_total, dividend_payment: 0};
    var player_companies = user.companies;
    var c;

    for(var x=0,len=companies.length;x<len;x++){
      c = companies[x];
      dividend_payment = dividend_payment + (railroads[c].dividend * player_companies[c].stocks_owned)
    }
    
    totals.dividend_payment = dividend_payment;
console.log(totals.dividend_payment);
    return (onlyDividend) ? totals.dividend_payment : totals;
  }

function buildGameInstance(obj){
  var comp, user = {};

  user[obj.user] = buildUserObj(obj.user, obj.game.num_players);

  var game_obj = {
    name: obj.game.name, 
    users: user,
    num_players: obj.game.num_players,
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
    open: false,
    name: comp+' Railroad',
    rr_treasury: 0,
    stocks_issued: 0,
    rr_income: 0,
    stock_value: 0,
    stock_price: 0,
    dividend: 0,
    remaining_stock: 0
  };
}

function buildUserObj(user, num_players){
  return {
    name: user,
    tag: user.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
    companies: {},
    cash_total: player_amts[num_players],
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
  var tag = db_game.companies[ obj.company.tag ];

  tag.rr_income = obj.company.rr_income;

  if(obj.num_purchased_stocks !== undefined){
    tag.remaining_stock = tag.remaining_stock - obj.num_purchased_stocks;  
    tag.rr_treasury = tag.rr_treasury + obj.purchase_price;
  }
  
  if(obj.action == 'init_company'){

    tag.stocks_issued = obj.company.stocks_issued;
    tag.stock_value   = obj.company.stock_value;
    tag.remaining_stock = tag.stocks_issued - 1;
    tag.rr_income = 0;
    tag.rr_treasury = obj.purchase_price;
    tag.open = true;
  }

  tag.dividend    = calcDividend(tag.stocks_issued, tag.rr_income);
  tag.stock_price = calcStockPrice(tag.stock_value, tag.dividend);
  
  return tag;
}

function userTransaction(obj, db_game){
  var curr_user = db_game.users[ obj.user ];
  var curr_user_company = db_game.users[ obj.user ].companies[ obj.company.tag ];
  var curr_company = db_game.companies[ obj.company.tag ];

  curr_user_company.stocks_owned = curr_user_company.stocks_owned + obj.num_purchased_stocks;
  curr_user_company.dividend = calcDividend(curr_company.stocks_issued, curr_company.rr_income);

  curr_user.cash_total = curr_user.cash_total - obj.purchase_price;
  curr_user.companies[ obj.company.tag ] = curr_user_company;

  return curr_user;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

