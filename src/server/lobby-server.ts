import * as express from 'express';
import { Server }  from 'http';
import { GameServer } from './game-server';
import { Game } from '../core/game';
import { GAME_LOBBY_COUNTDOWN, GAME_CODE_LENGTH } from './server-interface';

export class LobbyServer {
  server: Server;
  app: express.Express;
  gameStartTimer: number = null; // Timeout id
  playersInRandLobby: number = 0; // Number of players sitting in random lobby
  currentRandLobby: string; // Unique hash for lobby
  gameServer: GameServer;

  constructor(server: Server, app: express.Express, gameServer: GameServer) {
    this.app = app;
    this.server = server;
    this.gameServer = gameServer;
    this.refreshRandGame();
  }

  // Returns new lobby's hashcode
  createNewLobby() : string {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < GAME_CODE_LENGTH; i++) {
      code += alphabet[Math.floor(Math.random()*alphabet.length)];
    }
    return code;
  }

  joinRandom(req: express.Request, res: express.Response) {
    this.playersInRandLobby += 1;
    console.log("Players waiting for random game to start: ", this.playersInRandLobby);

    this.resetTimer();
    res.setHeader('Content-Type', 'application/json');
    res.send({gameCode: this.currentRandLobby});
    if (this.playersInRandLobby === Game.settings.maxPlayers) {
      this.refreshRandGame();
    } else if (this.playersInRandLobby >= Game.settings.minPlayers) {
      this.gameStartTimer = setTimeout(this.startRandGamePrematurely.bind(this), GAME_LOBBY_COUNTDOWN);
    }
  }

  createPrivate(req: express.Request, res: express.Response) {
    res.setHeader('Content-Type', 'application/json');
    res.send({gameCode: this.createNewLobby()});
  }

  resetTimer() {
      if (this.gameStartTimer !== null) {
        clearTimeout(this.gameStartTimer);
      }
      this.gameStartTimer = null;
  }

  refreshRandGame() {
    this.resetTimer();
    this.currentRandLobby = this.createNewLobby();
    this.playersInRandLobby = 0;
  }

  startRandGamePrematurely() {
    this.gameServer.startGame(this.currentRandLobby);
    this.refreshRandGame();
  }
}
