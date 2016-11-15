import { GameState, Game, InputFrame } from '../core/game';
import * as SocketIO from 'socket.io';
import * as _ from 'lodash';

import { SEND_STATE_UPDATE, StatePayload } from './server-interface';
import { SEND_FRAMES } from '../client/client-interface';

const TICKS_PER_SECOND = 60;
const DEV_DELAY = 0; // Delays the updates sent to clients to simulate slower connections
export class GameServer {
  game: GameState;
  sockets: SocketIO.Socket[];
  disconnects: string[] = [];
  playerSockets: Map<string, SocketIO.Socket> = new Map();
  lastTick: number = 0;

  // Keeps track of the timestamp of the latest input that the server has applied for each player
  lastUpdateTimestamps: Map<SocketIO.Socket, number> = new Map();

  // The unprocessed inputs for each player
  frameBuffers: {[id:string]: InputFrame[]} = {};

  constructor(sockets: SocketIO.Socket[]) {
    this.game = Game.init();
    this.lastTick = Date.now();
    this.sockets = sockets;
    for (var socket of this.sockets) {
      let player = Game.addPlayer(this.game);
      socket.on(SEND_FRAMES, (frames: InputFrame[]) => this.acceptFrames(frames, player.id));
      socket.on('disconnect', () => this.onDisconnection(player.id));
      socket.emit('start game', {
        playerId: player.id,
        gameState: this.game,
      });
      this.playerSockets.set(player.id, socket);
    }
    this.tick();
  }

  tick() {
    let {game, frameBuffers, disconnects, lastTick} = this;
    let delta = Date.now() - lastTick;
    this.lastTick += delta;

    // Handle client disconnect
    disconnects.forEach(id => Game.removePlayer(game, id));

    // Update the "most recent update" timestamp for each player to
    // inform it of how delayed its server payload is
    _.forIn(frameBuffers, (frames, playerId) =>
      this.lastUpdateTimestamps.set(this.playerSockets.get(playerId), _.last(frames).timestamp));

    let frames = _.flatten(_.values(frameBuffers));
    let events = Game.applyInputs(game, frames);
    events = events.concat(Game.update(game, delta));
    Game.resolveEvents(game, events);
    this.sendState();
    this.frameBuffers = {};
    this.disconnects = [];
    setTimeout(this.tick.bind(this), (1/TICKS_PER_SECOND) * 1000);
  }

  onDisconnection(playerId: string) {
    this.disconnects.push(playerId);
  }

  acceptFrames(frames: InputFrame[], playerId: string) {
    this.frameBuffers[playerId] = (this.frameBuffers[playerId] || []).concat(frames);
  }

  sendState() {
      for (var socket of this.sockets) {
        const payload: StatePayload = { // separate variable to ensure type adherence
          game: _.cloneDeep(this.game), // Allows DEV_DELAY'd update to use old game TODO: Remove for prod
          timestamp: this.lastUpdateTimestamps.get(socket) || 0,
        };
        setTimeout(() => { // Simulates slow connection, TODO: Remove for prod
          socket.emit(SEND_STATE_UPDATE, payload);
        }, DEV_DELAY);
      }
  }

}
