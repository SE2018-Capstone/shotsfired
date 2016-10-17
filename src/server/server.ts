import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import { LobbyServer } from './lobby-server';
var app = express();
var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, '../')));
app.get('/', function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

server.listen(3000, function () {
  console.log('listening on *:3000');
});

new LobbyServer(server);
