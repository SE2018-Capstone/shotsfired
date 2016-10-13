
import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
var app = express();
var server = http.Server(app);
var io = socketio(server);

app.use(express.static(path.resolve(__dirname, '../')));
app.get('/', function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

io.on('connection', function(socket: any){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

server.listen(4000, function () {
  console.log('listening on *:4000');
});
