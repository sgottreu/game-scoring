exports = module.exports = function(io){
  io.sockets.on('connection', function (socket) {
    console.log('client connected');
    socket.on('disconnect', function(){
        console.log('client disconnected');
    });
  });
}