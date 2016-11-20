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
    let pathName = window.location.pathname.substring(1); // Cutting off preceding '/'
    console.log(pathName);
    if (pathName.length === 5) {
      // We are reserving all 5 character urls as game urls
      this.socketInit(pathName);
      this.state = { stage: Stages.LOADING };
    }
  }

  createPrivateGame() {
    this.createLobby('createPrivate');
  }

  joinRandomGame() {
    this.createLobby('join');
  }

  createLobby(endpoint:string) {
    let currentUrl = window.location.origin;
    fetch(currentUrl+'/'+endpoint).then((response: any) => {
      response.json().then((json: any) => {
        this.socketInit(json['gameCode']);
      });
    });
    this.setState({ stage: Stages.LOADING });
  }

  socketInit(gameCode: string) {
    this.socket = socketIo({query: 'gamecode='+gameCode});
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('Game started!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
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
