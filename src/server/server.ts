import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as cluster from 'cluster';
import * as os from 'os';
import { LobbyServer } from './lobby-server';
import { GameServer } from './game-server';
import * as process from 'process';

var app = express();
var server = http.createServer(app);

if (cluster.isMaster) {
  app.use(express.static(path.resolve(__dirname, '../')));
  app.get('/', function (req: express.Request, res: express.Response) {
    res.sendFile(path.resolve(__dirname, '../index.html'));
  });

  server.listen(process.env.PORT || 3000, function () {
    console.log('Port given by process.env variable: ', process.env.PORT);
    console.log('Listening on port ', process.env.PORT || 3000);
  });

  let game_processes: cluster.Worker[] = [];
  for (let i = 0; i < os.cpus().length; i++) {
    game_processes.push(cluster.fork());
  }
  new LobbyServer(server, app, game_processes);
} else {
  new GameServer(server);
}
