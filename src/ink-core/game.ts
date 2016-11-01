import { Event } from '../core/event';

export interface InputFrame {
  down: boolean
  mouseX: number
  mouseY: number
  duration: number;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  settings: {
  };
};

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480 },
      settings: {}
    }, overrides) as GameState;
  }

  static update(game: GameState, delta: number): Event[] {
    return [];
  }

  static applyInputs(state: GameState, inputs: InputFrame[]): Event[] {
    var events: Event[] = [];
    inputs.forEach(input => {
      events = events.concat();
    });

    return events;
  }

  static resolveEvents(game: GameState, events: Event[]): void {
  }
}
