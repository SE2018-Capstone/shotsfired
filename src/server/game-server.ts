import { Server }  from 'http';
import { GameState, Game, InputFrame } from '../core/game';
import * as SocketIO from 'socket.io';

export class GameServer {
  io: SocketIO.Server;
  game: GameState;

  constructor(server: Server) {
    this.game = Game.init();
    this.io = SocketIO(server);
    this.io.on('connection', this.onConnection.bind(this));
  }

  onConnection(socket: SocketIO.Socket) {
    let player = Game.addPlayer(this.game);
    socket.emit('registration', {
      playerId: player.id,
      gameState: this.game,
    });
    socket.on('new frames', this.acceptFrames.bind(this));
  }

  acceptFrames(frames: InputFrame[]) {
    console.log('Frames!:', frames[0].angle);
  }

}