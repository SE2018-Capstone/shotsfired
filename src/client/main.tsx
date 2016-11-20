import * as React from 'react';
import * as socketIo from 'socket.io-client';
import fetch from 'node-fetch';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';

enum Stages { SPLASH, LOADING, RUNNING };
export interface ClientState { stage: Stages; }
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  gameToJoin: string;
  activePlayer: string;

  constructor() {
    super();
    this.state = { stage: Stages.SPLASH };
  }

  joinRandomGame() {
    let currentUrl = window.location.origin;
    fetch(currentUrl+'/join').then((response: any) => {
      response.json().then((json: any) => {
        console.log("Connecting to",currentUrl + json['gameUrl']);//DELTE
        this.socketInit(currentUrl + json['gameUrl']);
      });
    });
  }

  socketInit(url: string) {
    this.socket = socketIo(url);
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('Game started!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.setState({ stage: Stages.LOADING });
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket);
      this.setState({stage: Stages.RUNNING});
  }

  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        return <Splash onQuickPlay={() => this.joinRandomGame()} />;
      case Stages.LOADING:
        return <div> Loading... </div>;
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
