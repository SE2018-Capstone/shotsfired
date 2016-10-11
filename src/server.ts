var app = require('express')();
var http = require('http').Server(app);
var socket = require('socket.io');
var io = socket(http);

app.get('/', function(req: any, res: any){
  res.send('<h1>Hi world</h1>');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
