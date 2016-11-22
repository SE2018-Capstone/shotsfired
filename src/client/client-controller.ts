import { Game, GameState, InputFrame } from '../core/game';
import { Event } from '../core/event';

import { SEND_STATE_UPDATE, StatePayload } from '../server/server-interface';
import { SEND_FRAMES } from './client-interface';

export class ClientController {
  game: GameState;
  socket: SocketIOClient.Socket;
  serverUpdate: StatePayload | null = null;
  unsyncedFrames: InputFrame[] = []; // Frames that the server copy does not include yet
  onGameFinished: () => void;

  constructor(game: GameState, socket: SocketIOClient.Socket, onGameFinished: () => void) {
    this.game = game;
    this.socket = socket;
    this.socket.on(SEND_STATE_UPDATE, this.receiveServerUpdate.bind(this));
    this.onGameFinished = onGameFinished;
  }

  update(input: InputFrame) {
    const {serverUpdate, unsyncedFrames} = this;

    if (serverUpdate) {
      Object.assign(this.game, serverUpdate.game);

      // The server's copy of the game world may be outdated, therefore
      // we must simulate the game state up to the current frame
      const newUnsyncedFrames = unsyncedFrames.filter(
        ({timestamp}) => timestamp > serverUpdate.timestamp);
      const newUnsyncedEvents = Game.applyInputs(this.game, newUnsyncedFrames);
      Game.resolveEvents(this.game, newUnsyncedEvents);
      console.log(input.timestamp - serverUpdate.timestamp);
      Game.update(this.game, input.timestamp - serverUpdate.timestamp);

      this.unsyncedFrames = newUnsyncedFrames;
      this.serverUpdate = null;
    }

    // Apply the current input to the game state
    let events: Event[] = [];
    if (this.game.entities.players[input.playerId]) {
      this.unsyncedFrames.push(input);
      this.sendFramesToServer([input]);
      events = events.concat(Game.applyInputs(this.game, [input]));
    }
    events = events.concat(Game.update(this.game, input.duration));
    Game.resolveEvents(this.game, events);

    Game.setIsFinished(this.game);
    if (this.game.isFinished) {
      this.onGameFinished();
    }
  }

  receiveServerUpdate(update: StatePayload) {
    this.serverUpdate = update;
  }

  sendFramesToServer(frames: InputFrame[]) {
    this.socket.emit(SEND_FRAMES, frames);
  }
}
