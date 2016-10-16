import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import { ServerSocket } from './server-socket';
import { Game, FrameEvent, GameState } from '../core/game';
var app = express();
var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, '../')));
app.get('/', function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

server.listen(3000, function () {
  console.log('listening on *:3000');
});

export class Server {
  game: Game;
  socket: ServerSocket;

  constructor() {
    this.game = new Game();
    this.socket = new ServerSocket(this.game, server);
  }
}

var s = new Server();
