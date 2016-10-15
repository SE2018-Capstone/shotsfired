import * as socketIo from 'socket.io-client';
import { Game, FrameEvent, GameState } from '../core/game';

// This class deals with all communication with the server on the client side.
export class ClientSocket {
  socket: SocketIOClient.Socket;
  game: Game;

  constructor(game: Game) {
    this.game = game;
    this.socket = socketIo();
    this.socket.on('state update', this.receiveState);
  }

  receiveState(update: GameState) {
    this.game.applyState(update);
  }

  sendFrame(frame: FrameEvent) {
    this.socket.emit('new frame', frame);
  }
}
