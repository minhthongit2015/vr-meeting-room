
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let members = ["hello", "hallo", "ola"];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected: ', socket);

  socket.on('disconnect', function(info) {
    console.log('user disconnected: ', info);
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });


  /// --------------------------------------------------

  
  socket.on('join-in', function(msg) {
    io.emit('member-in', msg);
    socket.emit("sync-in", "clients: ", JSON.stringify(members));
    console.log('member-in: ' + msg);
  });

  socket.on('join-out', function(msg){
    io.emit('member-out', msg);
    console.log('member-out: ' + msg);
  });
});

let server = http.listen(process.env.PORT || 80, function(){
  console.log('listening on *:' + server.address().port);
});