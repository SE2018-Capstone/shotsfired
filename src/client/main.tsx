import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { Game } from '../core/game';

export class Main extends React.Component<{}, {}> {
  game: Game;
  socket: SocketIOClient.Socket;
  
  constructor() {
    super();
    this.game = new Game();  
    this.socket = socketIo('localhost:3000');
    this.socket.on('state update', function(update:any) {
      console.log(update);
    });
  }
  
  render() {
    return (
      <div>
        <GameCanvas width={640} height={480} gameState={this.game}/>
      </div>
    );
  }
}
