import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { InkGameCanvas } from './ink-game-canvas';
import { GameState } from '../ink-core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';

enum Stages { SPLASH, LOADING, RUNNING };
export interface ClientState { stage: Stages; time: number;}
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  activePlayer: string;

  constructor() {
    super();
    this.state = { stage: Stages.SPLASH, time: 0 };

    // Comment away to enable the START GAME
    //this.socketInit();
  }

  socketInit() {
    this.socket = socketIo();
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('connection!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.setState({ stage: Stages.LOADING, time: this.state.time });
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket, (t) => this.setState({stage: this.state.stage, time: t}));
      this.setState({stage: Stages.RUNNING, time: this.state.time });
  }

  readTextInput(event: Event) {
    console.log("input was: " + event.srcElement.nodeValue);
  }


  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        return <Splash onQuickPlay={() => this.socketInit()} />;
      case Stages.LOADING:
        return <div> Loading... </div>;
      case Stages.RUNNING:
        return (
          <div>
          <div> Player: {this.activePlayer} </div>
            <InkGameCanvas
              game={this.gameState}
              playerId={this.activePlayer}
              onTick={(input) => this.controller.update(input)}
            />
            <div id="score"> {this.state.time} </div>
            <div id="info">
              <input type="text" name="guess" onChange={this.readTextInput.bind(this)}/>
            </div>
          </div>
        );
    }
  }
}
