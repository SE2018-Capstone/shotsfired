import { Event } from '../core/event';

export interface InputFrame {
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
    return [];
  }

  static resolveEvents(game: GameState, events: Event[]): void {
  }
}
