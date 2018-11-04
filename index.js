
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


  /************************************ Side 1 ************************************/

  // [Side 1] Tạo room cho riêng mình
  // socket.join(socket.id, (err) => {
  //   let rooms = Object.keys(socket.rooms);
  // });

  // [Side 1] Xử ký sự kiện: Lấy ID để chia sẻ
  socket.on('getID', function(info) {
    socket.name = info;
    socket.emit("setID", socket.id);
  });

  // [Side 1] Xử lý trung chuyển dữ liệu từ Master tới các Friend (trong room)
  socket.on("syncData", (frdID, data) => { // Dữ liệu xuất phát từ máy Master
    socket.broadcast.to(frdID).emit("syncDataRecv", socket.id, data);
  });


  /************************************ Side 2 ************************************/

  // [Side 2] Xử lý sự kiện yêu cầu dữ liệu từ friend
  socket.on('syncWith', function(frdID) {
    // Gửi yêu cầu tới master
    socket.broadcast.to(frdID).emit("startSync", frdID, socket.id);
  });

  // [Side 2] Thông báo đã nhận xong đến master
  socket.on("notifyOK", (masterID, slaverName) => {
    socket.broadcast.to(masterID).emit("syncDataDone", slaverName);
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