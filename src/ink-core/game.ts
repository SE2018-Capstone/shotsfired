import { Bullet, BulletState } from './bullet'
import { Event } from '../ink-core/event';

export interface InputFrame {
  down: boolean;
  mouseX: number;
  mouseY: number;
  duration: number;
  playerId: string;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    bullets: {[id:string]:BulletState}
  }
  settings: {
  };
};

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480 },
      entities: { bullets: {} },
      settings: {}
    }, overrides) as GameState;
  }

  static update(game: GameState, delta: number): Event[] {
    let {bullets} = game.entities;
    let events: Event[] = [];

    // events = Object.keys(bullets).reduce((events, bulletId) => {
    //   return events.concat(Bullet.update(bullets[bulletId], delta, game));
    // }, events);
  
    return events;
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
