import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { GameState } from '../core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';

const GAME_START_TIME = 5;
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
    this.state = { stage: Stages.SPLASH, numPlayersInLobby: 0, countdownTime: GAME_START_TIME };
  }

  socketInit() {
    this.socket = socketIo();
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('connection!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.socket.on('new player', (numPlayers: number) => {
      this.resetTimer();
      this.updateCountdown(GAME_START_TIME);
      this.setState({ stage: this.state.stage, numPlayersInLobby: numPlayers, countdownTime: GAME_START_TIME })
    })
    this.setState({
      stage: Stages.LOADING,
      numPlayersInLobby: this.state.numPlayersInLobby,
      countdownTime: this.state.countdownTime
    });
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket);
      this.setState({
        stage: Stages.RUNNING,
        numPlayersInLobby: this.state.numPlayersInLobby,
        countdownTime: this.state.countdownTime
      });
      this.resetTimer();
  }

  updateCountdown(time: number) {
    this.setState({
      stage: this.state.stage,
      numPlayersInLobby: this.state.numPlayersInLobby,
      countdownTime: time
    });
    if (time - 1 >= 0) {
      this.countdownTimer = setTimeout(this.updateCountdown.bind(this), 1000, time - 1);
    }
  }

  resetTimer() {
    if (this.countdownTimer != null) {
      clearTimeout(this.countdownTimer);
    }
    this.countdownTimer = null;
  }

  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        return <Splash onQuickPlay={() => this.socketInit()} />;
      case Stages.LOADING:
        let moreThanOnePlayer = this.state.numPlayersInLobby > 1;
        return (
          <div style={{textAlign: 'center'}} >
            <h2>
              Waiting for more players to join... {(moreThanOnePlayer) ? this.state.countdownTime : ""}
            </h2>
            <br/>
            Currently {this.state.numPlayersInLobby} player{(moreThanOnePlayer) ? "s" : ""} in the lobby
          </div>
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
