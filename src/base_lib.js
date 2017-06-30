var moment = require('moment');

exports = module.exports = function(io) {
  var keyify = function(key){
    return key.replace(/[@\.]/g, '_');
  };

  var createNamespace = function(nsp_socket, user, game){
    var np = keyify(user.tag)+'_'+game;

    nsp_socket[np] = io.of('/'+np);
    nsp_socket[np].on('connection', function(socket){
        console.log(user.tag+' connected to nsp channel: '+np);
    });
    return nsp_socket;
  };

  var inArray = function(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
  };
  
  var getNearbyGames = function(docs, game){
    var nearby = [], _id = game.game_oid;
    var past_date = moment().subtract(7, 'days').format('YYYY-MM-DD');

    for(var x=0,len=docs.length;x<len;x++){
        if(docs[x].completed == 0  && moment(docs[x]._date).isAfter(past_date)){
        nearby.push(docs[x]);
        } else { // If url is used & game is complete
        if(_id !== undefined){
            if(_id == docs[x]._id){
            nearby.push(docs[x]);
            }
        }
        }
        
    }
    return nearby;
  };

  var getGamesByEmail = function(docs, game){
    var nearby = [], _id = game.game_oid, email = game.email;
    var past_date = moment().subtract(7, 'days').format('YYYY-MM-DD');

    for(var x=0,len=docs.length;x<len;x++){
        for ( var u in docs[x].users ) {
        if (docs[x].users.hasOwnProperty(u)) {
            if( docs[x].users[u].email == game.email && moment(docs[x]._date).isAfter(past_date) ){
            nearby.push(docs[x]);
            } 
        }
        }
    }

    return nearby;
  };


  return {
    nsp_socket: {},
    keyify : keyify,
    createNamespace: createNamespace,
    inArray: inArray,
    getGamesByEmail: getGamesByEmail,
    getNearbyGames: getNearbyGames
  }
};