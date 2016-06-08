var app = require('express')();
var dateFormat = require('dateformat');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var messages = {};

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('joinroom', function (room) {
    socket.join(room);
    socket.room = room;
    console.log('user joined room: ' + room);

    if (!messages[room]) {
      messages[room] = [];
    }

    for (var message of messages[room]) {
      socket.emit('msg', message);
    }
  });

  socket.on('msg', function (msg) {
    let room = socket.room;
    if (!room) return;

    let time = dateFormat(Date.now(), "h:MM:ss TT");
    let message = [time, "guest", msg];
    messages[room].push(message);
    if (messages.length > 100) messages.slice();
    io.to(room).emit('msg', message);
    console.log(time + ' ' + room + ' <guest> ' + msg);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
