import { GameState, Game, InputFrame } from '../core/game';
import * as SocketIO from 'socket.io';

const TICKS_PER_SECOND = 60;
export class GameServer {
  game: GameState;
  sockets: SocketIO.Socket[];
  frameBuffer: InputFrame[];
  disconnects: string[];
  lastTick: number;
  gameStartPromise: Promise<{}>;
  startGame: () => void; // resolves the promise

  constructor(sockets: SocketIO.Socket[]) {
    this.game = Game.init();
    this.frameBuffer = [];
    this.disconnects = [];
    this.lastTick = Date.now();
    this.sockets = sockets;
    for (var socket of this.sockets) {
      let player = Game.addPlayer(this.game);
      socket.on('new frames', this.acceptFrames.bind(this));
      socket.on('disconnect', () => this.onDisconnection(player.id));
      socket.emit('start game', {
        playerId: player.id,
        gameState: this.game,
      });
    }
    this.tick();
  }

  tick() {
    let {game, frameBuffer, disconnects, lastTick} = this;
    this.frameBuffer = [];
    this.disconnects = [];
    let delta = Date.now() - lastTick;
    this.lastTick += delta;

    // Handle client disconnect
    disconnects.forEach(id => Game.removePlayer(game, id));
    let events = Game.applyInputs(game, frameBuffer);
    events = events.concat(Game.update(game, delta));
    Game.resolveEvents(game, events);
    this.sendState();
    setTimeout(this.tick.bind(this), (1/TICKS_PER_SECOND) * 1000);
  }

  onDisconnection(playerId: string) {
    this.disconnects.push(playerId);
  }

  acceptFrames(frames: InputFrame[]) {
    this.frameBuffer = this.frameBuffer.concat(frames);
  }

  sendState() {
    for (var socket of this.sockets) {
      socket.emit('state update', this.game);
    }
  }

}
