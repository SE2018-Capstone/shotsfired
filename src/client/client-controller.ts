import { Game, GameState, InputFrame } from '../core/game';

// TODO: Move to a core file for interop
const UPDATE_EVENT = 'state update';
const SEND_EVENT = 'new frames';

export class ClientController {
  game: GameState;
  socket: SocketIOClient.Socket;
  serverUpdate: GameState | null;

  constructor(game: GameState, socket: SocketIOClient.Socket) {
    this.game = game;
    this.socket = socket;
    this.socket.on(UPDATE_EVENT, this.receiveState.bind(this));
  }

  update(input: InputFrame) {
    const {game, serverUpdate} = this;
    if (serverUpdate) {
      Object.assign(game, serverUpdate);
      this.serverUpdate = null;
    }

    this.sendFrame([input]); // TODO: Move this to a separate frequency
    let events = Game.applyInputs(game, [input]);
    events = events.concat(Game.update(game, input.duration));
    Game.resolveEvents(events, game);
  }

  receiveState(update: GameState) {
    console.log('Server update!', update);
    this.serverUpdate = update;
  }

  sendFrame(frames: InputFrame[]) {
    this.socket.emit(SEND_EVENT, frames);
  }
}
