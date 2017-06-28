var moment = require('moment');
var monk = require('monk');


exports = module.exports = function(io, db){
  var baseLib = require('./base_lib')(io);
  var db_collection = "game-scoring--games";

  var nsp_socket = baseLib.nsp_socket;

  var companies = ['blue','red', 'yellow', 'pink', 'green', 'brown', 'purple', 'black'];

  var player_amts = {
    3: 80,
    4: 60,
    5: 48,
    6: 40
  };

  io.sockets.on('connection', function (socket) {
    // console.log(socket.client.conn);
    console.log('connection for Continental Divide');

    socket.on('error', (error) => {
      console.log(error);
    });

    socket.on('conDiv_add_game_instance', function(obj){
        console.log('add_game_instance');
        addGameInstance(io, obj);
    });

    socket.on('conDiv_join_game_instance', function(obj){
        joinGameInstance(io, obj);
    });

    socket.on('conDiv_available_games', function(game){
      console.log('init conDiv_available_games');
      emitAvailableGames(game);
    });

    socket.on('conDiv_save_username', function(user){
        nsp_socket = baseLib.createNamespace(nsp_socket, user, 'conDiv');
        io.emit('conDiv_conDiv_save_username', user);
    });

    socket.on('conDiv_update_company', function(obj){
        purchaseTransaction(obj);
    });

    socket.on('conDiv_get_company', function(obj){
        getCompanyInfo(obj);
    });

    socket.on('conDiv_get_stock_values', function(obj){
        getStockValues(obj);
    });

    socket.on('conDiv_get_company_dividends', function(obj){
        getCompanyDividends(obj);
    });

    socket.on('conDiv_subtract_costs', function(obj){
        subtractCosts(obj);
    });

    socket.on('conDiv_modify_railroad_income', function(obj){
        updateRailroadIncome(obj);
    });

    socket.on('conDiv_get_player_totals', function(obj){
        getPlayerTotals(obj);
    });

    socket.on('conDiv_get_player_dividends', function(obj){
        getPlayerDividends(obj);
    });

    socket.on('conDiv_end_of_round', function(obj){
        savePlayerDividends(obj);
    });

    socket.on('conDiv_score_game', function(obj){
        calculateScore(obj.game_oid, obj.vp);
    });

    socket.on('conDiv_get_players', function(obj){
        getPlayers(obj);
    });


  });


  function increaseRound(obj){
      var available_games = db.get(db_collection);
      console.log('Increasing Round');
      available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
          game.current_round = parseInt(game.current_round) + 1;

          available_games.update( { "_id" : monk.id(obj.game_oid) }, game )
          .then(function(upd_game){
              console.log('Current Round: '+game.current_round);

              io.emit('conDiv_end_of_round', game);
          });
      });
  }

    function calculateScore(game_id, vp){
        var available_games = db.get(db_collection);
        var c, scores = [];
        available_games.findOne({ "_id" : monk.id(game_id) }).then(function(game) {
            console.log('calculating Score');

            game.scoring = vp;

            for ( var u in game.users ) {
            if (game.users.hasOwnProperty(u)) {
                game.users[u].vp = 0;
            }
            }

            for(var x=0,len=companies.length;x<len;x++){
            c = companies[x];
            vp[ c ].vp = 0;
            for ( var p in vp[ c ] ) {
                if (vp[ c ].hasOwnProperty(p)) {
                vp[ c ].vp += parseInt( vp[ c ][ p ] );
                }
            }
            game.companies[ c ].vp = vp[ c ].vp;

            for ( var u in game.users ) {
                if (game.users.hasOwnProperty(u)) {
                game.users[u].vp += ( parseInt(game.companies[ c ].vp) * parseInt(game.users[u].companies[c].stocks_owned) );
                }
            }
            }
            game.completed = 1;

            for ( var u in game.users ) {
            if (game.users.hasOwnProperty(u)) {
                scores.push( game.users[u] );
            }
            }

            available_games.findOneAndUpdate( { "_id" : monk.id(game._id) }, game )
            .then(function(new_game) {
            scores.sort(compareVictoryPoints);
            io.emit('conDiv_score_game', scores);
            });

        });
    }



  function emitAvailableGames(game){
    var available_games = db.get(db_collection);

    available_games.find({ name: game.name }).then(function(docs) { //

      for(var x=0,len=docs.length;x<len;x++){
          docs[x] = setGameAttrib(docs[x], game._id);
      }
      docs = (game.email !== undefined) ? baseLib.getGamesByEmail(docs, game) : baseLib.getNearbyGames(docs, game);

      io.emit('conDiv_available_games', docs);
    });
  }

  function compareVictoryPoints(a,b) {
    if (a.vp < b.vp)
        return 1;
    if (a.vp > b.vp)
        return -1;
    return 0;
    }

    function compareStocks(a,b) {
    if (a.stocks < b.stocks)
        return 1;
    if (a.stocks > b.stocks)
        return -1;
    return 0;
  }

  function addGameInstance(io, obj){
    var available_games = db.get(db_collection);
    var game_obj = buildGameInstance(obj);

    available_games.insert( game_obj).then(function (data) {
        emitAvailableGames(data);
        data.newest_user = baseLib.keyify(obj.user.tag);
        io.emit('conDiv_joined_game', data);
    });
  }

    function joinGameInstance(io, obj){
    var available_games = db.get(db_collection);

    console.log('Attempting to join game');

    available_games.findOne({ "_id" : monk.id(obj.game._id) }).then(function(game) {
        console.log('game found');
        if(game.users[ baseLib.keyify(obj.user.tag) ] === undefined){
        game.users = buildNewUserInstance(obj, game);

        available_games.findOneAndUpdate(
            { "_id" : monk.id(obj.game._id) },
            game
        ).then(function(docs) {
            console.log('Joining game');
            docs = setGameAttrib(docs, obj.game._id, obj.user);
            io.emit('conDiv_joined_game', docs);
        });
        } else {
        console.log('Joining game already a part of');
        game = setGameAttrib(game, obj.game._id, obj.user);
        io.emit('conDiv_joined_game', game);
        }
    });
    }

    function buildNewUserInstance(obj, game){
    var users = game.users;
    var key = baseLib.keyify(obj.user.tag);
    users[key] = buildUserObj(obj.user, game.num_players);
    for(var x=0,len=companies.length;x<len;x++){
        users[key].companies[ companies[x] ] = buildUserCompanyObj(companies[x]);
    }
    return users;
    }

    function getStockValues(obj){
    var available_games = db.get(db_collection);
    console.log('Getting Stock Values');
    available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
        var treasuries = {};
        for (var u in game.users) {
        if (game.users.hasOwnProperty(u)) {
            treasuries[u] = game.users[u].cash_total;
        }
        }

        io.emit('conDiv_get_stock_values', {
        companies: game.companies,
        purchase: obj.purchase,
        user_treasuries: treasuries
        });
    });
    }

    function getCompanyDividends(obj){
    var dividend_payment = {};
    var available_games = db.get(db_collection);
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
        io.emit('conDiv_get_company_dividends', dividend_payment );
    });
    }

    function saveCompanyDividends(obj){
    var available_games = db.get(db_collection);
    console.log('Saving Company Dividends');
    available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
        var cc, treasury;
        for(var x=0,len=companies.length;x<len;x++){
        cc = game.companies[ companies[x] ];
        cc.dividend    = calcDividend(cc.stocks_issued, cc.rr_income);
        cc.rr_treasury = cc.rr_treasury + calcDividendPayment(cc.dividend, cc.remaining_stock);
        game.companies[ companies[x] ] = cc;
        }

        available_games.update( { "_id" : monk.id(obj.game_oid) }, game )
        .then(function(upd_game){
            console.log('Company treasury updated');
            io.emit('conDiv_update_company_treasury', true );
            
            var round = increaseRound(obj);
            io.emit('conDiv_increase_round', round);
        });
    });
    }

    function savePlayerDividends(obj){
    var available_games = db.get(db_collection);
    console.log('Saving Player Dividends');
    available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
        for (var u in game.users) {
        if (game.users.hasOwnProperty(u)) {
            game.users[u].cash_total += calcPlayerDividend(game.users[u], game.companies, true);
        }
        }

        available_games.update( { "_id" : monk.id(obj.game_oid) }, game )
        .then(function(upd_game){
            console.log('Player treasuries updated');
            nsp_socket[obj.client].emit('conDiv_close_player_dividend_window', true);
            saveCompanyDividends(obj);
        });
    });
    }

    function setGameAttrib(game, _id, user){
      game.date = moment(game._id.getTimestamp()).format("MM/DD/YYYY");
      game._date = moment(game._id.getTimestamp());
      game.selected = (_id !== undefined && _id.toString() == game._id.toString()) ? true : false;
      if(user !== undefined){
          game.newest_user = baseLib.keyify(user.tag);
      }

      return game;
    }

    function getPlayers(obj){
    var available_games = db.get(db_collection);
    console.log('Getting Players');
    available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
        var players = [];
        for (var u in game.users) {
        if (game.users.hasOwnProperty(u)) {
            players.push({name: game.users[u].name, tag: baseLib.keyify(game.users[u].tag) });
        }
        }

        nsp_socket[obj.client].emit('conDiv_get_players', players);

    });
    }

    function getCompanyInfo(obj){
    var available_games = db.get(db_collection);
    console.log('Getting company');

    available_games.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(game) {
        var c = obj.company_name;
        game.companies[c].stockholders = getStockHolders(game, c);
        io.emit('conDiv_get_company', game.companies[ c ]);
    });
    }

    function getStockHolders(game, company_name, func){
    var players = [], c = company_name;
    for (var u in game.users) {
        if (game.users.hasOwnProperty(u)) {
        players.push({name: game.users[u].name, stocks: parseInt(game.users[u].companies[c].stocks_owned) });
        }
    }
    players.sort(compareStocks);
    return players;
    }

    function purchaseTransaction(obj){
    var avail_game = db.get(db_collection);
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
        db_game.companies[obj.company.tag].stockholders = getStockHolders(db_game, obj.company.tag);
        io.emit('conDiv_update_company', db_game.companies[ obj.company.tag ]);

        nsp_socket[obj.client].emit('conDiv_close_purchase_window', true);
        });
    });
    }

    function updateRailroadIncome(obj){
    var avail_game = db.get(db_collection);
    console.log('updating income');

    avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
        console.log('Found game company to update');
        db_game.companies[ obj.company.tag ] = calcCompanyValues(obj, db_game);

        avail_game.update(
        { "_id" : monk.id(obj.game_oid) },
        db_game )
        .then(function(game){
        db_game.companies[obj.company.tag].stockholders = getStockHolders(db_game, obj.company.tag, 'updateRailroadIncome');
        io.emit('conDiv_update_company', db_game.companies[ obj.company.tag ]);
        console.log('Company updated');
        nsp_socket[obj.client].emit('conDiv_close_income_window', true);
        console.log('Send Close Window');
        });
    });
    }

    function subtractCosts(obj){
    var avail_game = db.get(db_collection);
    console.log('subtract_costs income');

    avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
        console.log('Found game company to update');
        db_game.companies[ obj.company ].rr_treasury = db_game.companies[ obj.company ].rr_treasury - parseInt(obj.costs);

        avail_game.update(
        { "_id" : monk.id(obj.game_oid) },
        db_game )
        .then(function(game){
        console.log('Company updated');
        db_game.companies[obj.company].stockholders = getStockHolders(db_game, obj.company);
        io.emit('conDiv_update_company', db_game.companies[ obj.company ]);

        nsp_socket[obj.client].emit('conDiv_close_costs_window', true);
        });
    });
    }

    function getPlayerTotals(obj){
    var avail_game = db.get(db_collection);
    console.log('get player totals');

    avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
        console.log('Found game ');

        var totals = calcPlayerDividend(db_game.users[obj.user], db_game.companies);

        nsp_socket[obj.client].emit('conDiv_get_player_totals', totals);

    });
    }

    function getPlayerDividends(obj){
    var avail_game = db.get(db_collection);
    console.log('get player dividends');

    avail_game.findOne({ "_id" : monk.id(obj.game_oid) }).then(function(db_game) {
        console.log('Found game ');

        var users = {};

        for (var user in db_game.users) {
        if (db_game.users.hasOwnProperty(user)) {
            users[user] = calcPlayerDividend(db_game.users[user], db_game.companies);
            users[user].tag = baseLib.keyify(db_game.users[user].tag);
        }
        }
        io.emit('conDiv_get_player_dividends', users);
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

    function calcPlayerDividend(user, rr, onlyDividend){
        onlyDividend = (onlyDividend === undefined) ? false : onlyDividend;
        var dividend_payment = 0;
        var totals = {user_treasury: user.cash_total, dividend_payment: 0};
        // Player Companies
        var pc = user.companies;
        var c;
        var stocks = [];

        for(var x=0,len=companies.length;x<len;x++){
        c = companies[x];
        dividend_payment = dividend_payment + (rr[c].dividend * pc[c].stocks_owned);
        if(pc[c].stocks_owned > 0){
            stocks.push( { name: c, stocks: pc[c].stocks_owned } );
        }
        }

        totals.stocks = stocks.sort(compareStocks);
        totals.dividend_payment = dividend_payment;

        return (onlyDividend) ? dividend_payment : totals;
    }

    function buildGameInstance(obj){
    var comp, user = {};
    key = baseLib.keyify(obj.user.tag);
    user[key] = buildUserObj(obj.user, obj.game.num_players);

    var game_obj = {
        name: obj.game.name,
        current_round: 1,
        users: user,
        location: obj.user.location,
        num_players: obj.game.num_players,
        companies: {},
        creator: obj.user,
        completed: 0,
        scoring: {}
    };

    for(var x=0,len=companies.length;x<len;x++){
        comp = companies[x];
        game_obj.companies[ comp ] = buildCompanyObj(comp);
        game_obj.users[key].companies[ comp ] = buildUserCompanyObj(comp);
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
    if(typeof user !== 'object' || user.name === undefined || user.tag === undefined ){
        return false;
    }

    if(isNaN(num_players) || parseInt(num_players) < 3 || parseInt(num_players) > 6){
        return false;
    }

    return {
        name: user.name,
        email: user.email,
        tag: baseLib.keyify(user.tag),
        companies: {},
        cash_total: player_amts[num_players],
        dividend_payment: 0,
        vp: 0
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







}