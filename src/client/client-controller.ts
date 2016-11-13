import { Game, GameState, InputFrame } from '../ink-core/game';
import { Event } from '../core/event';

// TODO: Move to a core file for interop
const UPDATE_EVENT = 'state update';
const SEND_EVENT = 'new frames';

export class ClientController {
  game: GameState;
  socket: SocketIOClient.Socket;
  serverUpdate: GameState | null;
  onChange: (s: any) => void;

  constructor(game: GameState, socket: SocketIOClient.Socket, onChange: (s: any) => void) {
    this.game = game;
    this.socket = socket;
    this.socket.on(UPDATE_EVENT, this.receiveState.bind(this));
    this.onChange = onChange;
  }

  update(input: InputFrame) {
    const {game, serverUpdate} = this;
    if (serverUpdate) {
      Object.assign(game, serverUpdate);
      this.serverUpdate = null;
    }

    let events: Event[] = [];
    // if (game.entities.players[input.playerId]) {
      this.sendFrame([input]); // TODO: Move this to a separate frequency
      events = events.concat(Game.applyInputs(game, [input]));
    // }
    events = events.concat(Game.update(game, input.duration));
    Game.resolveEvents(game, events);
    this.onChange(input.duration);
  }

  receiveState(update: GameState) {
    this.serverUpdate = update;
  }

  sendFrame(frames: InputFrame[]) {
    this.socket.emit(SEND_EVENT, frames);
  }
}
