import { Game, GameState, InputFrame } from '../ink-core/game';
import { Event } from '../core/event';

// TODO: Move to a core file for interop
const UPDATE_EVENT = 'state update';
const SEND_EVENT = 'new frames';

export class ClientController {
  game: GameState;
  socket: SocketIOClient.Socket;
  serverUpdate: GameState | null;
  playerId: string;
  onChange: (s: any, b: boolean) => void;

  constructor(game: GameState, socket: SocketIOClient.Socket, playerId: string, onChange: (s: any, b: boolean) => void) {
    this.game = game;
    this.socket = socket;
    this.socket.on(UPDATE_EVENT, this.receiveState.bind(this));
    this.playerId = playerId;
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
    this.onChange(game.entities.players[this.playerId].score, game.entities.players[this.playerId].isDrawer);
  }

  updateGuess(playerId: string, guess: string, points: number) {
    const input: InputFrame = {
      down: false,
      mouseX: 0,
      mouseY: 0,
      duration: 0,
      playerId: playerId,
      reset: false,
      guess: guess,
      score: points
    }
    this.update(input);
  }

  receiveState(update: GameState) {
    this.serverUpdate = update;
  }

  sendFrame(frames: InputFrame[]) {
    this.socket.emit(SEND_EVENT, frames);
  }
}
