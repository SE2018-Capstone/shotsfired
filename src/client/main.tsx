import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';

enum Stages { SPLASH, LOADING, RUNNING, WINNER, GAMEOVER };
export interface ClientState { stage: Stages; }
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  activePlayer: string;

  constructor() {
    super();
    this.state = { stage: Stages.SPLASH };
  }

  socketInit() {
    this.socket = socketIo();
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('connection!');
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
            this.setState({stage: Stages.WINNER});
          }
          else {
            this.setState({stage: Stages.GAMEOVER});
          }
        }
      });
      this.setState({stage: Stages.RUNNING});
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
      case Stages.WINNER:
        return (
          <div>
            <h2> Congratulations, you won! </h2>
          </div>
        );
      case Stages.GAMEOVER:
        return (
          <div>
            <h2> Game Over! Better luck next time... </h2>
          </div>
        );
    }
  }
}
