var app = require('express')();
var dateFormat = require('dateformat');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var messages = [];

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  for (var message of messages) {
    socket.emit('chat message', message);
  }

  socket.on('chat message', function (msg) {
    let time = dateFormat(Date.now(), "h:MM:ss TT");
    let message = [time, "guest", msg];
    messages.push(message);
    io.emit('chat message', message);
    if (messages.length > 100) messages.slice();
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
