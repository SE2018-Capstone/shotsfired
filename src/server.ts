import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
var app = express();
var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, '../')));
app.get('/', function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

server.listen(3000, function () {
  console.log('listening on *:3000');
});
/*
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req: any, res: any){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket: any){
  console.log('a user connected!');

  socket.on('disconnect', function(){
    console.log('user disc');
  });

  socket.on('message chat', function(msg: string) {
    console.log('message: ' + msg);
    io.emit('update!', msg);
    socket.broadcast.emit('update!!', 'dat boi sent a msg: ' + socket.io.engine.id);
  });
*/
