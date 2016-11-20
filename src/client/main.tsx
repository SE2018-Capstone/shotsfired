import * as React from 'react';
import * as socketIo from 'socket.io-client';
import fetch from 'node-fetch';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';
import { Lobby } from './lobby'
import { GAME_LOBBY_COUNTDOWN, NEW_PLAYER_JOINED } from '../server/server-interface'

enum Stages { SPLASH, LOADING, RUNNING };
export interface ClientState {
  stage: Stages;
  numPlayersInLobby: number;
}
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  gameToJoin: string;
  activePlayer: string;

  constructor() {
    super();
    this.state = {
      stage: Stages.SPLASH,
      numPlayersInLobby: 0,
    };
  }

  joinRandomGame() {
    let currentUrl = window.location.origin;
    fetch(currentUrl+'/join').then((response: any) => {
      response.json().then((json: any) => {
        this.socketInit('/'+json['serverNum'],json['gameCode']);
      });
    });
  }

  socketInit(url: string, gameCode: string) {
    console.log(url, gameCode);
    this.socket = socketIo(url, {query: 'gamecode='+gameCode});
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('Game started!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.socket.on(NEW_PLAYER_JOINED, (numPlayers: number) => {
      this.setState({
        numPlayersInLobby: numPlayers,
      } as ClientState);
    })
    this.setState({
      stage: Stages.LOADING
    } as ClientState);
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket);
      this.setState({
        stage: Stages.RUNNING
      } as ClientState);
  }

  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        return <Splash onQuickPlay={() => this.joinRandomGame()} />;
      case Stages.LOADING:
        return (
          <Lobby
            numPlayersInLobby={this.state.numPlayersInLobby}
            maxCountdownTime={GAME_LOBBY_COUNTDOWN/1000}
          />
        );
      case Stages.RUNNING:
        return (
          <div>
          <div> Player: {this.activePlayer} </div>
            <GameCanvas
              game={this.gameState}
              playerId={this.activePlayer}
              onTick={(input) => this.controller.update(input)}
            />
          </div>
        );
    }
  }
}
