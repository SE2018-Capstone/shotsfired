import { Express } from 'express';
import * as cluster from 'cluster';
import { Server }  from 'http';
import * as SocketIO from 'socket.io';
import { ChildProcess } from 'child_process';
import { GameServer } from './game-server';
import { Game } from '../core/game';
import { GAME_LOBBY_COUNTDOWN, NEW_PLAYER_JOINED } from './server-interface'

export class LobbyServer {
  players: SocketIO.Socket[];
  game_processes: ChildProcess[];
  io: SocketIO.Server;
  server: Server;
  app: Express;
  gameStartTimer: number; // Timeout id
  currentProcess: number; // Index in game_processes to send next game to
  playersInRandLobby: number; // Number of players sitting in random lobby
  currentRandLobby: string; // Unique hash for lobby, url to send to

  constructor(server: Server, game_processes: ChildProcess[], app: Express) {
    this.currentProcess = 0;
    this.playersInJoinLobby = 0;
    this.app = app;
    this.server = server;
    this.game_processes = game_processes;
    this.io = SocketIO(this.server);
    this.refreshLobby();
    this.io.on('connection', this.onConnection.bind(this));
    this.createInitialEndpoints();
  }

  createNewLobby() : string {}

  createInitialEndpoints(){
    app.get('/join', (req: express.Request, res: express.Response) => {
      if (playersInRandLobby == 0) {
        this.currentRandLobby = this.createNewLobby();
      }
      this.playersInRandLobby += 1;
      console.log("Players waiting for random game to start: ", this.playersInRandLobby);

      this.resetTimer();
      if (this.playersInRandLobby == Game.settings.maxPlayers) {
        this.startGame();
      } else if (this.players.length >= Game.settings.minPlayers) {
        this.gameStartTimer = setTimeout(this.startGamePrematurely.bind(this), GAME_START_TIME);
      }
      this.playersInRandLobby %= Game.settings.maxPlayers;
      // Start new game
      //this.game_processes[this.currentProcess].send('addplayer', this.players[i]);
    }
      res.redirect('/' + hashcode);
    });

    app.get('/createprivate', (req: express.Request, res: express.Response) = {
      res.redirect('/' + this.createNewLobby());
    });
  }
  
  onConnection(socket: SocketIO.Socket) {
    this.players.push(socket);
    socket.on('disconnect', () => this.onDisconnection(this.players.length-1));
    console.log("Players in lobby: ", this.players.length);

    this.resetTimer();
    for (var playerSocket of this.players) {
      playerSocket.emit(NEW_PLAYER_JOINED, this.players.length);
    }
    if (this.players.length > Game.settings.maxPlayers) {
      // Assuming we won't go from max-1 players to max+1 players
      console.log("CRITICAL ERROR: too many players");
    } else if (this.players.length == Game.settings.maxPlayers) {
      this.startGame();
    } else if (this.players.length >= Game.settings.minPlayers) {
      this.gameStartTimer = setTimeout(this.startGame.bind(this), GAME_LOBBY_COUNTDOWN);
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
    // Round robin scheduling for the game processes
    this.currentProcess = (this.currentProcess + 1) % this.game_processes.length;
    this.resetTimer();
    this.playersInRandLobby = 0;
  }

  startGame() {
    this.refreshLobby();
  }
  
  startGamePrematurely() {
    // Game will automatically start with MAX_PLAYERS, expect this to only be called with < MAX_PLAYERS
    this.game_processes[this.currentProcess].send('startgame', this.players[i]);
    this.startGame();
  }
}
