import { GameState, Game, InputFrame } from '../core/game';
import { Server }  from 'http';
import * as SocketIO from 'socket.io';
import * as _ from 'lodash';
import { SEND_STATE_UPDATE, StatePayload } from './server-interface';
import { SEND_FRAMES } from '../client/client-interface';
import * as process from 'process';

export interface IPCMessage {
  accept?: number;
  startgame?: string;
}

const TICKS_PER_SECOND = 60;
const DEV_DELAY = 0; // Delays the updates sent to clients to simulate slower connections
export class GameServer {
  io: SocketIO.Server;
  server: Server;
  processId: number = null; // unique number that identifies which gameserver process you are
  sockets: SocketIO.Socket[];
  activeGames: Map<string,GameInstance> = new Map<string,GameInstance>(); // String is unique hash given by lobby-server

  constructor(server: Server) {
    this.server = server;

    process.on('message', (m: IPCMessage) => {
      if ('accept' in m) {
        // ASSUMING THIS IS ONLY CALLED ONCE
        // This is essentially the constructor of the GameServer, and most initialization is done here.
        // Must happen before anything else is called on this object
        if (this.processId !== null) {
          console.log(this.processId, m['accept']);
          throw new Error('This process has already had its id set');
        }
        this.processId = m.accept;
        // Connect via socket
        this.io = SocketIO(this.server);
        console.log('/'+this.processId); // TODO DELTE THIS
        this.io.of('/'+this.processId).on('connection', this.onConnection.bind(this));
      } else if ('startgame' in m) {
        this.activeGames.get(m.startgame).startGame();
      }
    });
  }

  onConnection(socket: SocketIO.Socket) {
    const gameCode = socket.handshake.query.gamecode;
    console.log(gameCode);
    if (!(gameCode in this.activeGames)) {
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
  sockets: SocketIO.Socket[];
  disconnects: string[] = [];
  playerSockets: Map<string, SocketIO.Socket> = new Map();
  gameFinishedCallback: ()=>void;
  connectedPlayers: number = 0; // Number of players currently connected via socket
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
    this.connectedPlayers += 1;
    socket.on('disconnect', () => this.onPregameDisconnection(socket));
    if (this.sockets.length == Game.settings.maxPlayers) {
      this.startGame();
    }
  }

  startGame() {
    for (var socket of this.sockets) {
      let player = Game.addPlayer(this.game);
      socket.on(SEND_FRAMES, (frames: InputFrame[]) => this.acceptFrames(frames, player.id));
      socket.removeAllListeners('disconnect');
      socket.on('disconnect', () => this.onDisconnection(player.id));
      socket.on('new frames', this.acceptFrames.bind(this));
      socket.emit('start game', {
        playerId: player.id,
        gameState: this.game,
      });
      this.playerSockets.set(player.id, socket);
    }
    this.tick();
  }

  onPregameDisconnection(socket: SocketIO.Socket) {
    this.sockets.splice(this.sockets.indexOf(socket), 1);
    this.connectedPlayers -= 1;
  }

  onDisconnection(playerId: string) {
    this.connectedPlayers -= 1;
    if (this.connectedPlayers <= 1) {
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
    if (this.connectedPlayers > 0) {
      // Don't call tick again if nobody is in the game anymore
      setTimeout(this.tick.bind(this), (1/TICKS_PER_SECOND) * 1000);
    }
  }

  onDisconnection(playerId: string) {
    this.disconnects.push(playerId);
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
