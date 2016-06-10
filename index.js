var express = require('express');
var app = express();
var dateFormat = require('dateformat');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var messages = {};

io.on('connection', function (socket) {
  socket.nick = "guest";

  console.log('a user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('joinroom', function (room) {
    socket.join(room);
    socket.room = room;
    console.log(socket.nick + ' joined room: ' + room);

    if (!messages[room]) {
      messages[room] = [];
    }

    for (var message of messages[room]) {
      socket.emit('msg', message);
    }
  });

  socket.on('leaveroom', function (room) {
    socket.leave(socket.room);
    delete socket.room;
  });

  socket.on('msg', function (msg) {
    let room = socket.room;
    let time = dateFormat(Date.now(), "h:MM:ss TT");
    console.log(time + ' ' + room + ' <' + socket.nick + '> ' + msg);
    if (!room) {
      console.log('no room! ignoring');
      return;
    }

    let message = [time, socket.nick, msg];
    messages[room].push(message);
    if (messages.length > 100) messages.slice();
    io.to(room).emit('msg', message);
  });

  socket.on('nick', function (nick) {
    console.log('setting nick: ' + nick);
    socket.nick = nick;
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
