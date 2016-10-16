import { Server }  from 'http';
import { GameState, Game, InputFrame } from '../core/game';
import * as SocketIO from 'socket.io';

const TICKS_PER_SECOND = 30;
export class GameServer {
  io: SocketIO.Server;
  game: GameState;
  frameBuffer: InputFrame[];
  lastTick: number;

  constructor(server: Server) {
    this.game = Game.init();
    this.io = SocketIO(server);
    this.io.on('connection', this.onConnection.bind(this));

    this.frameBuffer = [];
    this.lastTick = Date.now();
    this.tick();
  }

  tick() {
    let {game, frameBuffer, lastTick} = this;
    this.frameBuffer = [];
    let delta = Date.now() - lastTick;
    lastTick += delta;

    // Handle client disconnect

    Game.applyInputs(game, frameBuffer);
    Game.update(game, delta);
    this.sendState();
    setTimeout(this.tick.bind(this), (1/TICKS_PER_SECOND) * 1000);
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
    this.frameBuffer = this.frameBuffer.concat(frames);
  }

  sendState() {
    this.io.emit('state update', this.game); // might need timestamp?
  }

}