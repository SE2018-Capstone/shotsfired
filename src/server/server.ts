import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import { LobbyServer } from './lobby-server';
import * as process from 'process';

var app = express();
var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, '../')));
app.get('/', function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

server.listen(process.env.PORT || 3000, function () {
  console.log('Port given by process.env variable: ', process.env.PORT);
  console.log('Listening on port ', process.env.PORT || 3000);
});

new LobbyServer(server);
