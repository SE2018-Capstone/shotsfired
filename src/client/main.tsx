import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';
import { Lobby } from './lobby'
import { GAME_START_TIME, SEND_NEW_PLAYER_JOINED } from '../server/server-interface'

enum Stages { SPLASH, LOADING, RUNNING };
export interface ClientState {
  stage: Stages;
  numPlayersInLobby: number;
  countdownTime: number;
}
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  activePlayer: string;
  countdownTimer: number;

  constructor() {
    super();
    this.state = {
      stage: Stages.SPLASH,
      numPlayersInLobby: 0,
      countdownTime: GAME_START_TIME/1000
    };
  }

  socketInit() {
    this.socket = socketIo();
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('connection!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.socket.on(SEND_NEW_PLAYER_JOINED, (numPlayers: number) => {
      this.setState({
        numPlayersInLobby: numPlayers,
        countdownTime: GAME_START_TIME/1000
      } as ClientState);
    })
    this.setState({
      stage: Stages.LOADING,
    } as ClientState);
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket);
      this.setState({
        stage: Stages.RUNNING,
      } as ClientState);
  }

  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        return <Splash onQuickPlay={() => this.socketInit()} />;
      case Stages.LOADING:
        return <Lobby numPlayersInLobby={this.state.numPlayersInLobby} maxCountdownTime={this.state.countdownTime} />;
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
