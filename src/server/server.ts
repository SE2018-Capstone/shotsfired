
import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as SocketIO from 'socket.io';
var app = express();
var server = http.createServer(app);
var io = SocketIO(server);

app.use(express.static(path.resolve(__dirname, '../')));
app.get('/', function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

io.on('connection', function(socket: SocketIO.Socket){
  console.log('a user connected');
  io.emit('state update', 'player joined');
  io.emit('state update', socket.id);
});

server.listen(3000, function () {
  console.log('listening on *:3000');
});
