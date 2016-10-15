import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { Game, GameState } from '../core/game';

export class Main extends React.Component<{}, {}> {
  gameState: GameState;
  socket: SocketIOClient.Socket;
  
  constructor() {
    super();
    this.gameState = Game.init(1280, 720);
    this.socket = socketIo('localhost:3000');
    this.socket.on('state update', function(update:any) {
      console.log(update);
    });
  }
  
  render() {
    return (
      <div>
        <GameCanvas gameState={this.gameState}/>
      </div>
    );
  }
}
