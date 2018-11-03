
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let members = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected: ');

  /// Chừa ra một phần cho IUH SP

  socket.on('getID', function(info) {
    socket.name = info;
    socket.emit("setID", socket.id);

    // Tạo room cho riêng mình
    socket.join(socket.id, (err) => {
      let rooms = Object.keys(socket.rooms);
    });

    // Nhận được yêu cầu gửi dữ liệu của client
    socket.on("startSync", (frdID) => {
      if (frdID == socket.id) socket.emit("startSync", frdID);
    });

    // Master gửi dữ liệu đến slaver
    socket.on("syncData", (data) => {
      socket.to(socket.id).emit("syncData", data);
    });

    // Thông báo đã hoàn tất tới master
    socket.on("syncDataDone", (info) => {
      if (info.split("~")[0] == socket.id) socket.emit("syncDataDone", info);
    });

  });

  // Slave
  socket.on('syncWith', function(frdID) {
    // Gửi yêu cầu tới master
    socket.join(frdID, (err) => {
      socket.to(frdID).emit("startSync", frdID);
    });
    
    // Nhận được dữ liệu từ master
    socket.on("syncData", (data) => {
      socket.emit("syncData", data);
    });

    // Thông báo đã nhận xong đến master
    socket.on("notifyOK", (info) => {
      socket.to(info.split("~")[0]).emit("syncDataDone", info);
    });
  });

  ///

  socket.on('disconnect', function(info) {
    console.log('user disconnected: ', info);
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });


  /// --------------------------------------------------

  
  socket.on('join-in', function(msg) {
    let newMember = JSON.parse(msg);
    if (!members[newMember.name]) members[newMember.name] = newMember;
    io.emit('member-in', msg);
    socket.emit("sync-in", JSON.stringify(members));
    console.log('member-in: ' + msg);
  });

  socket.on('join-out', function(msg) {
    let oldMember = JSON.parse(msg);
    if (members[oldMember.name]) delete members[oldMember.name];
    io.emit('member-out', msg);
    console.log('member-out: ' + msg);
  });


  /// --------------------------------------------------

  
  socket.on('moving', function(msg){
    let moveMember = JSON.parse(msg);
    if (!members[moveMember.name])
      members[moveMember.name] = { name: moveMember.name, position: moveMember.position };
    else
      members[moveMember.name].position = moveMember.position;
    io.emit('moving', msg);
  });
});

let server = http.listen(process.env.PORT || 80, function(){
  console.log('listening on *:' + server.address().port);
});