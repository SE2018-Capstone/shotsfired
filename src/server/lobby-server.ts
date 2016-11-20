import * as cluster from 'cluster';
import { Server }  from 'http';
import { GameServer } from './game-server';
import * as SocketIO from 'socket.io';
import { Game } from '../core/game';
import { GAME_START_TIME, SEND_NEW_PLAYER_JOINED } from './server-interface'

export class LobbyServer {
  players: SocketIO.Socket[];
  io: SocketIO.Server;
  server: Server;
  gameStartTimer: number; // Timeout id


  constructor(server: Server) {
    this.server = server;
    this.io = SocketIO(this.server);
    this.refreshLobby();
    this.io.on('connection', this.onConnection.bind(this));
  }
  
  onConnection(socket: SocketIO.Socket) {
    this.players.push(socket);
    socket.on('disconnect', () => this.onDisconnection(this.players.length-1));
    console.log("Players in lobby: ", this.players.length);

    this.resetTimer();
    for (var playerSocket of this.players) {
      playerSocket.emit(SEND_NEW_PLAYER_JOINED, this.players.length);
    }
    if (this.players.length > Game.settings.maxPlayers) {
      // Assuming we won't go from max-1 players to max+1 players
      console.log("CRITICAL ERROR: too many players");
    } else if (this.players.length == Game.settings.maxPlayers) {
      this.startGame();
    } else if (this.players.length >= Game.settings.minPlayers) {
      this.gameStartTimer = setTimeout(this.startGame.bind(this), GAME_START_TIME);
    }
  }

  onDisconnection(playerNum: number) {
    this.players.splice(playerNum, 1);
    if (this.players.length < Game.settings.minPlayers) {
      this.resetTimer();
    }
  }

  resetTimer() {
      if (this.gameStartTimer != null) {
        clearTimeout(this.gameStartTimer);
      }
      this.gameStartTimer = null;
  }

  refreshLobby() {
    this.resetTimer();
    this.players = [];
  }

  startGame() {
      // Start new game
      new GameServer(this.players);
      this.refreshLobby();
  }
}
