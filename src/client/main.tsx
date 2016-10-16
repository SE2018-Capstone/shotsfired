import * as React from 'react';
import * as socketIo from 'socket.io-client';
import { GameCanvas } from './game-canvas';
import { Game, GameState } from '../core/game';

export class Main extends React.Component<{}, {}> {
  gameState: GameState;
  socket: SocketIOClient.Socket;
  activePlayer: number;

  constructor() {
    super();
    this.gameState = Game.init({width: 1280, height: 720});
    const player = Game.addPlayer(this.gameState); // TODO: Make this acquired by the server
    this.activePlayer = player.id;
    this.socket = socketIo('localhost:3000');
    this.socket.on('state update', function(update:any) {
      console.log(update);
    });
  }

  render() {
    return (
      <div>
        <GameCanvas game={this.gameState} playerId={this.activePlayer}/>
      </div>
    );
  }
}
