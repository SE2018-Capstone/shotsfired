import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { Game, GameState } from '../core/game';

export class Main extends React.Component<{}, {}> {
  game: GameState;
  socket: SocketIOClient.Socket;
  
  constructor() {
    super();
    this.game = Game.init();
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
