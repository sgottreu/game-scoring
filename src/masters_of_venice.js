var moment = require('moment');
var monk = require('monk');


exports = module.exports = function(io, db){
  var baseLib = require('./base_lib')(io);
  var db_collection = "game-scoring--games";

  var nsp_socket = baseLib.nsp_socket;

  io.sockets.on('connection', function (socket) {
    // console.log(socket.client.conn);
    console.log('connection for Masters of Venice');

    socket.on('error', (error) => {
      console.log(error);
    });

    socket.on('masVen_add_game_instance', function(obj){
        console.log('add_game_instance');
        addGameInstance(io, obj);
    });

    socket.on('masVen_join_game_instance', function(obj){
        joinGameInstance(io, obj);
    });

    socket.on('masVen_available_games', function(game){
      console.log('init masVen_available_games');
      emitAvailableGames(game);
    });

    // socket.on('masVen_save_username', function(user){
    //   io.emit('masVen_save_username', user);
    // });
  });


  function emitAvailableGames(game){
    var available_games = db.get(db_collection);

    available_games.find({ name: game.name }).then(function(docs) { //

      for(var x=0,len=docs.length;x<len;x++){
          docs[x] = setGameAttrib(docs[x], game._id);
      }
      docs = (game.email !== undefined) ? baseLib.getGamesByEmail(docs, game) : baseLib.getNearbyGames(docs, game);
console.log('Processed '+docs.length+' docs');
      io.emit('masVen_available_games', docs);
    });
  }

  function addGameInstance(io, obj){
    var available_games = db.get(db_collection);
    console.log('Adding game instance');
    delete obj.game._id;
    var game_obj = buildGameInstance(obj);

    available_games.insert( game_obj).then(function (data) {
        emitAvailableGames(data);
        //data.newest_user = baseLib.keyify(obj.user.tag);
        console.log('masVen_joined_game');
        io.emit('masVen_joined_game', data);
    });
  }

  function joinGameInstance(io, obj){
      var available_games = db.get(db_collection);

      console.log('Attempting to join game');

      available_games.findOne({ "_id" : monk.id(obj.game._id) }).then(function(game) {
          console.log('game found');
          if(game.users[ baseLib.keyify(obj.user.tag) ] === undefined){

          available_games.findOneAndUpdate(
              { "_id" : monk.id(obj.game._id) },
              game
          ).then(function(docs) {
              console.log('Joining game');
              docs = setGameAttrib(docs, obj.game._id, obj.user);
              io.emit('masVen_joined_game', docs);
          });
          } else {
          console.log('Joining game already a part of');
          game = setGameAttrib(game, obj.game._id, obj.user);
          io.emit('masVen_joined_game', game);
          }
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

  function buildGameInstance(obj){
      var comp, user = {};
      key = baseLib.keyify(obj.user.tag);

      var game_obj = {
          user: key,
          name: obj.game.name,
          state: obj.state,
          creator: obj.user,
      };

      return game_obj;
  }





}