import * as React from 'react';
import { GameCanvas } from './game-canvas';
import { Game } from '../core/game';

export class Main extends React.Component<{}, {}> {
  game: Game;
  
  constructor() {
    super();
    this.game = new Game();  
  }
  
  render() {
    return (
      <div>
        <GameCanvas width={640} height={480} gameState={this.game}/>
      </div>
    );
  }
}