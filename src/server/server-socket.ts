import * as socketIo from 'socket.io';
import { Game, FrameEvent, GameState } from '../core/game';

// This class deals with all communication with the server on the client side.
export class ServerSocket {
  io: SocketIO.Server;
  game: Game;

  sendState() {
    this.io.emit('state update', this.game.state);
  }

  receiveFrame(frame: FrameEvent) {
    this.game.applyFrame(frame);
    this.sendState();
  }

  onConnection(socket: SocketIO.Socket) {
    console.log('a user connected');
    socket.on('new frame', this.receiveFrame);
  }

  constructor(game: Game, server: any) {
    this.game = game;
    this.io = socketIo(server);
    this.io.on('connection', this.onConnection);
  }
}
