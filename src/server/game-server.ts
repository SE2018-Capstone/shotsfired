import { Server }  from 'http';
import { GameState, Game, InputFrame } from '../core/game';
import * as SocketIO from 'socket.io';

const TICKS_PER_SECOND = 60;
export class GameServer {
  io: SocketIO.Server;
  game: GameState;
  frameBuffer: InputFrame[];
  disconnects: string[];
  lastTick: number;

  constructor(server: Server) {
    this.game = Game.init();
    this.io = SocketIO(server);
    this.io.on('connection', this.onConnection.bind(this));

    this.frameBuffer = [];
    this.disconnects = [];
    this.lastTick = Date.now();
    this.tick();
  }

  tick() {
    let {game, frameBuffer, disconnects, lastTick} = this;
    this.frameBuffer = [];
    this.disconnects = [];
    let delta = Date.now() - lastTick;
    lastTick += delta;

    // Handle client disconnect
    disconnects.forEach(id => Game.removePlayer(game, id));
    let events = Game.applyInputs(game, frameBuffer);
    events = events.concat(Game.update(game, delta));
    Game.resolveEvents(game, events);
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
    socket.on('disconnect', () => this.onDisconnection(player.id));
  }

  onDisconnection(playerId: string) {
    this.disconnects.push(playerId);
  }

  acceptFrames(frames: InputFrame[]) {
    this.frameBuffer = this.frameBuffer.concat(frames);
  }

  sendState() {
    this.io.emit('state update', this.game); // might need timestamp?
  }

}