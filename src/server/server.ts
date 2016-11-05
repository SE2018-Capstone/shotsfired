import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as child_process from 'child_process';
import * as os from 'os';
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

let game_processes: child_process.ChildProcess[] = [];
for (let i = 0; i < os.cpus().length; i++) {
  game_processes.push(child_process.fork(__dirname + "/backendgame.js"));
}
new LobbyServer(server, game_processes, app);
