import { GameState, Game, InputFrame } from '../core/game';
import { Server }  from 'http';
import * as SocketIO from 'socket.io';
import * as _ from 'lodash';
import { START_GAME, SEND_STATE_UPDATE, StatePayload, NEW_PLAYER_JOINED } from './server-interface';
import { SEND_FRAMES } from '../client/client-interface';

const TICKS_PER_SECOND = 60;
const DEV_DELAY = 0; // Delays the updates sent to clients to simulate slower connections
export class GameServer {
  io: SocketIO.Server;
  sockets: SocketIO.Socket[];
  activeGames: Map<string,GameInstance> = new Map<string,GameInstance>(); // String is unique hash given by lobby-server

  constructor(server: Server) {
    this.io = SocketIO(server);
    this.io.on('connection', this.onConnection.bind(this));
  }

  startGame(gameCode: string) {
    this.activeGames.get(gameCode).startGame();
  }

  onConnection(socket: SocketIO.Socket) {
    const gameCode = socket.handshake.query.gamecode;
    if (!(this.activeGames.get(gameCode))) {
      this.activeGames.set(gameCode, new GameInstance(()=>this.onGameFinished(gameCode)));
    }
    this.activeGames.get(gameCode).addPlayer(socket);
  }

  onGameFinished(gameCode : string) {
    this.activeGames.delete(gameCode);
  }
}

class GameInstance {
  game: GameState;
  sockets: SocketIO.Socket[] = [];
  disconnects: string[] = [];
  playerSockets: Map<string, SocketIO.Socket> = new Map();
  gameFinishedCallback: ()=>void;
  lastTick: number = 0;

  // Keeps track of the timestamp of the latest input that the server has applied for each player
  lastUpdateTimestamps: Map<SocketIO.Socket, number> = new Map();

  // The unprocessed inputs for each player
  frameBuffers: {[id:string]: InputFrame[]} = {};

  constructor(gameFinishedCallback: ()=>void) {
    this.gameFinishedCallback = gameFinishedCallback;
    this.game = Game.init();
    this.lastTick = Date.now();
  }

  addPlayer(socket: SocketIO.Socket) {
    this.sockets.push(socket);
    socket.on('disconnect', () => this.onDisconnection(socket));
    if (this.sockets.length == Game.settings.maxPlayers) {
      this.startGame();
    }
    for (let s of this.sockets) {
      s.emit(NEW_PLAYER_JOINED, this.sockets.length);
    }
  }

  startGame() {
    for (var socket of this.sockets) {
      let player = Game.addPlayer(this.game);
      socket.on(SEND_FRAMES, (frames: InputFrame[]) => this.acceptFrames(frames, player.id));
      socket.on('disconnect', () => this.onInGameDisconnection(socket, player.id));
      socket.emit(START_GAME, {
        playerId: player.id,
        gameState: this.game,
      });
      this.playerSockets.set(player.id, socket);
    }
    this.tick();
  }

  onDisconnection(socket: SocketIO.Socket) {
    this.sockets.splice(this.sockets.indexOf(socket), 1);
  }

  onInGameDisconnection(playerId: string) {
    if (this.sockets.length <= 1) {
      this.gameFinishedCallback();
    }
    this.disconnects.push(playerId);
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
    if (this.sockets.length > 0) {
      // Don't call tick again if nobody is in the game anymore
      setTimeout(this.tick.bind(this), (1/TICKS_PER_SECOND) * 1000);
    }
  }

  acceptFrames(frames: InputFrame[], playerId: string) {
    this.frameBuffers[playerId] = (this.frameBuffers[playerId] || []).concat(frames);
  }

  sendState() {
    this.sockets.forEach((socket) => {
      const payload: StatePayload = { // separate variable to ensure type adherence
        game: _.cloneDeep(this.game), // Allows DEV_DELAY'd update to use old game TODO: Remove for prod
        timestamp: this.lastUpdateTimestamps.get(socket) || 0,
      };
      setTimeout(() => { // Simulates slow connection, TODO: Remove for prod
        socket.emit(SEND_STATE_UPDATE, payload);
      }, DEV_DELAY);
    });
  }
}
