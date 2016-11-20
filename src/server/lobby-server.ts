import * as express from 'express';
import { Server }  from 'http';
import { Worker } from 'cluster';
import { GameServer } from './game-server';
import { Game } from '../core/game';

interface lobbyInfo {
  // Information that should be returned to the client, so they can connect to our individual game servers
  serverNum: number,
  gameCode: string // Unique hash for lobby, url to send to
}

const GAME_START_TIME = 5000;
export class LobbyServer {
  players: SocketIO.Socket[];
  gameProcesses: Worker[];
  server: Server;
  app: express.Express;
  gameStartTimer: number; // Timeout id
  currentProcess: number = 0; // Index in gameProcesses to send next game to
  playersInRandLobby: number = 0; // Number of players sitting in random lobby
  currentRandLobby: lobbyInfo;

  constructor(server: Server, app: express.Express, gameProcesses: Worker[]) {
    this.app = app;
    this.server = server;
    this.gameProcesses = gameProcesses;
    this.refreshRandGame();
    this.createInitialEndpoints();
  }

  // Returns new lobby url of form "<process_number>/<hashcode>"
  // For example, "1?gamecode=a3b1zm"
  createNewLobby() : lobbyInfo {
    // Round robin scheduling for the game processes
    this.currentProcess = (this.currentProcess + 1) % this.gameProcesses.length;
    return {serverNum: this.currentProcess, gameCode: this.generateRandomCode(6)};
  }

  generateRandomCode(length: number) : string {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
    let code = "";
    for (let i = 0; i < length; i++) {
      code += alphabet[Math.floor(Math.random()*alphabet.length)]
    }
    return code;
  }

  // Should only be called once
  createInitialEndpoints() {
    this.app.get('/join', (req: express.Request, res: express.Response) => {
      if (this.playersInRandLobby == 0) {
        this.currentRandLobby = this.createNewLobby();
      }
      this.playersInRandLobby += 1;
      console.log("Players waiting for random game to start: ", this.playersInRandLobby);

      this.resetTimer();
      if (this.playersInRandLobby == Game.settings.maxPlayers) {
        this.refreshRandGame();
      } else if (this.playersInRandLobby >= Game.settings.minPlayers) {
        this.gameStartTimer = setTimeout(this.startRandGamePrematurely.bind(this), GAME_START_TIME);
      }

      res.setHeader('Content-Type', 'application/json');
      res.send(this.currentRandLobby);
    });

    this.app.get('/createprivate', (req: express.Request, res: express.Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.createNewLobby());
    });

    for (let i = 0; i < this.gameProcesses.length; i++) {
      this.gameProcesses[i].send({'accept': i});
    }
  }
  
  resetTimer() {
      if (this.gameStartTimer != null) {
        clearTimeout(this.gameStartTimer);
      }
      this.gameStartTimer = null;
  }

  refreshRandGame() {
    this.resetTimer();
    this.playersInRandLobby = 0;
  }
  
  startRandGamePrematurely() {
    // Game will automatically start with MAX_PLAYERS, expect this to only be called with < MAX_PLAYERS
    this.gameProcesses[this.currentRandLobby.serverNum].send({'startgame': this.currentRandLobby});
    this.refreshRandGame();
  }
}
