import { GameState, Game, InputFrame } from '../core/game';
import { Server }  from 'http';
import * as SocketIO from 'socket.io';
import * as process from 'process';

export interface IPCMessage {
  accept?: number;
  startgame?: string;
}

const TICKS_PER_SECOND = 60;
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
          console.log(this.processId, m.accept);
          throw new Error('This process has already had its id set');
        }
        this.processId = m.accept;
        // Connect via socket
        this.io = SocketIO(this.server);
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
  sockets: SocketIO.Socket[] = [];
  frameBuffer: InputFrame[] = [];
  disconnects: string[] = [];
  gameFinishedCallback: ()=>void;
  lastTick: number;
  connectedPlayers: number = 0; // Number of players currently connected via socket
  gameStartPromise: Promise<{}>;

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
      socket.removeAllListeners('disconnect');
      socket.on('disconnect', () => this.onDisconnection(player.id));
      socket.on('new frames', this.acceptFrames.bind(this));
      socket.emit('start game', {
        playerId: player.id,
        gameState: this.game,
      });
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
    if (this.connectedPlayers > 0) {
      // Don't call tick again if nobody is in the game anymore
      setTimeout(this.tick.bind(this), (1/TICKS_PER_SECOND) * 1000);
    }
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
