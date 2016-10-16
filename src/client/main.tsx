import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';

export enum Stages { SPLASH, LOADING, RUNNING };
export interface ClientState { stage: Stages; }
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  activePlayer: number;

  constructor() {
    super();
    this.socket = socketIo();
    this.socket.on('registration', (initialData: {playerId: number, gameState: GameState}) => {
      console.log('connection!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.state = { stage: Stages.LOADING };
  }

  startGame(initialState: GameState, playerId: number) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket);
      this.setState({stage: Stages.RUNNING});
  }

  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        <Splash />
      case Stages.LOADING:
        return <div> Loading... </div>;
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
    }
  }
}
