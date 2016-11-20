import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as os from 'os';
import * as process from 'process';
import { LobbyServer } from './lobby-server';
import { GameServer } from './game-server';

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

let lobby = new LobbyServer(server, app, new GameServer(server));
app.get('/join', (req: express.Request, res: express.Response) => lobby.joinRandom(req,res));
app.get('/createprivate', (req: express.Request, res: express.Response) => lobby.createPrivate(req,res));
app.get(/[a-z0-9]{5}/, function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});
