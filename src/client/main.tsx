import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';
import { Lobby } from './lobby';
import { START_GAME, GAME_LOBBY_COUNTDOWN, NEW_PLAYER_JOINED } from '../server/server-interface'
import { Mapper } from './mapper';
import { Game } from '../core/game';
import { GameOver } from './game-over';

enum Stages { MAPPER, SPLASH, LOBBY, RUNNING, GAMEOVER };
export interface ClientState {
  stage: Stages;
  numPlayersInLobby: number;
}

export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  gameCode: string;
  activePlayer: string;
  isPrivateGame: boolean;

  constructor() {
    super();
    this.gameState = Game.init();
    this.state = {
      stage: Stages.SPLASH,
      numPlayersInLobby: 0,
    };
    let pathName = window.location.pathname;
    if (pathName.startsWith('/game/')) {
      this.socketInit(pathName.substring(6), true);
      this.state.stage = Stages.LOBBY;
    }
  }

  enterLobby() {
    this.setState({
      stage: Stages.LOBBY
    } as ClientState);
  }

  socketInit(gameCode: string, isPrivateGame: boolean) {
    console.log("GAMECODE: ", gameCode);
    this.isPrivateGame = isPrivateGame;
    this.gameCode = gameCode;
    this.socket = socketIo({query: 'gamecode='+gameCode});
    this.socket.on(START_GAME, (initialData: {playerId: string, gameState: GameState}) => {
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.socket.on(NEW_PLAYER_JOINED, (numPlayers: number) => {
      this.setState({
        numPlayersInLobby: numPlayers,
      } as ClientState);
    });
    this.setState({
      stage: Stages.LOBBY
    } as ClientState);
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket, () => this.onGameFinished());
      this.setState({
        stage: Stages.RUNNING
      } as ClientState);
  }

  onGameFinished() {
    this.socket.disconnect();
    this.setState({
      stage: Stages.GAMEOVER
    } as ClientState);
  }

  goToMainMenu() {
    this.setState({
      stage: Stages.SPLASH,
      numPlayersInLobby: 0
    }, () => {
      this.gameState = Game.init();
      this.activePlayer = "";
      this.controller = null;
      this.socket = null;
    });
  }

  render() {
    switch(this.state.stage) {
      case Stages.MAPPER: // Allows construction of maps
        return <Mapper game={this.gameState}/>;
      case Stages.SPLASH:
        return (
          <Splash
            onConnectToLobby={(gameCode, isPrivateGame) => this.socketInit(gameCode, isPrivateGame)}
            onEnterLobby={() => this.enterLobby()} />
        );
      case Stages.LOBBY:
        return (
          <Lobby
            numPlayersInLobby={this.state.numPlayersInLobby}
            maxCountdownTime={GAME_LOBBY_COUNTDOWN}
            gameCode={this.gameCode}
            isPrivateLobby={this.isPrivateGame}
          />
        );
      case Stages.RUNNING:
        return (
          <div>
            <GameCanvas
              game={this.gameState}
              playerId={this.activePlayer}
              onTick={(input) => this.controller.update(input)}
            />
          </div>
        );
      case Stages.GAMEOVER:
        const isWinner = this.gameState.winner === this.activePlayer;
        return (
          <GameOver
            isWinner={isWinner}
            onBackToMainMenu={() => this.goToMainMenu()}
          />
        );
    }
  }
}
