import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { InkGameCanvas } from './ink-game-canvas';
import { GameState } from '../ink-core/game';
import { ClientController } from './client-controller';
import { Splash } from './splash';

enum Stages { SPLASH, LOADING, RUNNING, WINNER, GAMEOVER };
export interface ClientState { 
  stage: Stages;
  score: number;
  displayOptions: boolean;
}
export class Main extends React.Component<{}, ClientState> {
  gameState: GameState;
  controller: ClientController;
  socket: SocketIOClient.Socket;
  activePlayer: string;

  constructor() {
    super();
    this.state = { stage: Stages.SPLASH, score: 0, displayOptions: false };
    this.readTextInput = this.readTextInput.bind(this);
    this.getSelectedAnswer = this.getSelectedAnswer.bind(this);
    // Comment away to enable the START GAME
    //this.socketInit();
  }

  socketInit() {
    this.socket = socketIo();
    this.socket.on('start game', (initialData: {playerId: string, gameState: GameState}) => {
      console.log('connection!');
      this.startGame(initialData.gameState, initialData.playerId);
    });
    this.setState({ stage: Stages.LOADING, score: this.state.score, displayOptions: false });
  }

  startGame(initialState: GameState, playerId: string) {
      this.gameState = initialState;
      this.activePlayer = playerId;
      this.controller = new ClientController(this.gameState, this.socket, this.activePlayer, (points, display, isDone) => {
        this.setState({stage: this.state.stage, score: points, displayOptions: display})
        if (this.state.score == 500) {
          this.setState({stage: Stages.WINNER, score: this.state.score, displayOptions: this.state.displayOptions})
        }
        else if (isDone) {
          this.setState({stage: Stages.GAMEOVER, score: this.state.score, displayOptions: this.state.displayOptions})          
        }
      });
      this.setState({stage: Stages.RUNNING, score: this.state.score, displayOptions: false });
  }

  readTextInput(event: any) {
    console.log("input was: " + event.target.value);
    this.controller.updateGuess(this.activePlayer, event.target.value, 0);
  }

  getSelectedAnswer(event: any) {
    console.log("selected answer was: " + event.target.value);
    this.controller.updateGuess(event.target.value, "", 100);
  }


  render() {
    switch(this.state.stage) {
      case Stages.SPLASH:
        return <Splash onQuickPlay={() => this.socketInit()} />;
      case Stages.LOADING:
        return <div> Loading... </div>;
      case Stages.RUNNING:
        let {bullets, players} = this.gameState.entities;
        let guesses: any[] = [];
        Object.keys(players).forEach(id => {
          if (id !== this.activePlayer) {
            guesses.push(<input type="radio" name="guess" value={id} onClick={this.getSelectedAnswer}/>);
            guesses.push(players[id].guess);
            guesses.push(<br/>);
          }
        })

        let optionDisplay:any = null;
        let userAction:string = null;
        if (this.state.displayOptions) {
          userAction = "It's your turn to draw!";
          optionDisplay = (
            <div style={{marginTop: 5}}>
              <div id="options" style={{float: 'left'}}>
                Pick the best guess below:
                <br/>
                {guesses}
              </div>
              <div style={{float: 'right'}}> Press the ENTER button to clear the canvas </div>
            </div>
          );
        }
        else {
          userAction = "Guess the drawing!";
          optionDisplay = (
            <div id="info" style={{marginTop: 5}}>
              Type in your guess here: 
              <input type="text" name="guess" onChange={this.readTextInput}/>
            </div>
          );
        }

        return (
          <div>
          <div style={{float: 'left', marginTop: 5}}> Player: {this.activePlayer} </div>
          <div id="score" style={{float: 'right', marginTop: 5}}> Score: {this.state.score} </div>
          <div style={{textAlign: 'center', fontSize: 25}} > {userAction} </div>
            <InkGameCanvas
              game={this.gameState}
              playerId={this.activePlayer}
              onTick={(input) => this.controller.update(input)}
            />
            {optionDisplay}
          </div>
        );
      case Stages.WINNER:
        return <h1> Congratulations, you won! </h1>;
      case Stages.GAMEOVER:
        return <h1> Better luck next time! </h1>;
    }
  }
}
