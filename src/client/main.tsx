import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';
import { GameOver } from './game-over'
import { REMATCH_COUNTDOWN_TIME } from './client-interface'

enum Stages { SPLASH, LOADING, RUNNING, GAMEOVER };
export interface ClientState { stage: Stages; }
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  activePlayer: string;
  isWinner: boolean;
  initialData: {playerId: string, gameState: GameState};

  constructor() {
    super();
    this.isWinner = false;
    this.state = { stage: Stages.SPLASH };
  }

  socketInit() {
    this.socket = socketIo();
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('connection!');
      this.initialData = initialData;
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.setState({ stage: Stages.LOADING });
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket, (winner: string, isDone: boolean) => {
        if (isDone) {
          if (winner === this.activePlayer) {
            this.isWinner = true;
          }
          this.setState({stage: Stages.GAMEOVER});
          console.log("game over");
        }
      });
      this.setState({stage: Stages.RUNNING});
  }

  rematch() {
    //option 1
    // this.controller = null;
    // this.startGame(this.initialData.gameState, this.initialData.playerId);

    //option 2
    // this.gameState = this.initialData.gameState;
    // this.setState({stage: Stages.RUNNING});
  }

  goToMainMenu() {
    this.gameState = null;
    this.controller = null;
    this.socket = null;
    this.activePlayer = null;
    this.isWinner = false;
    this.setState({stage: Stages.SPLASH});
    console.log("state is splashhh");
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
            <GameCanvas
              game={this.gameState}
              playerId={this.activePlayer}
              onTick={(input) => this.controller.update(input)}
            />
          </div>
        );
      case Stages.GAMEOVER:
        return (
          <GameOver
            isWinner={this.isWinner}
            maxCountdownTime={REMATCH_COUNTDOWN_TIME}
            onPlayAgain={() => this.rematch()}
            onBackToMainMenu={() => this.goToMainMenu()}
          />
        );
    }
  }
}
