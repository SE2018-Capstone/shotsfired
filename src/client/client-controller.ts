import { Game, GameState, InputFrame } from '../core/game';

// TODO: Move to a core file for interop
const UPDATE_EVENT = 'state update';
const SEND_EVENT = 'new frames';

export class ClientController {
  game: GameState;
  socket: SocketIOClient.Socket;

  constructor(game: GameState, socket: SocketIOClient.Socket) {
    this.game = game;
    this.socket = socket;
    this.socket.on(UPDATE_EVENT, this.receiveState.bind(this));
  }

  update(input: InputFrame) {
    this.sendFrame([input]); // TODO: Move this to a separate frequency
    Game.applyInputs(this.game, [input]);
    Game.update(this.game, input.duration);
  }

  receiveState(update: GameState) {
    Object.assign(this.game, update);
  }

  sendFrame(frames: InputFrame[]) {
    this.socket.emit(SEND_EVENT, frames);
  }
}