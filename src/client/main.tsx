import * as React from 'react';
import { GameCanvas } from './game-canvas';
import { Game } from '../core/game';
import { ClientSocket } from './client-socket';

export class Main extends React.Component<{}, {}> {
  game: Game;
  socket: ClientSocket;
  
  constructor() {
    super();
    this.game = new Game();  
    this.socket = new ClientSocket(this.game);
  }
  
  render() {
    return (
      <div>
        <GameCanvas width={640} height={480} gameState={this.game} socket={this.socket}/>
      </div>
    );
  }
}
