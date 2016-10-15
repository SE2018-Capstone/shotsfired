import { PlayerState } from './player';
import { BulletState } from './bullet';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  angle: number;
  fired: boolean;
  duration: number;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    players: PlayerState[];
    bullets: BulletState[];
  };
};

export class Game {
  static init(width: number = 640, height: number = 480) {
    return {
      world: { width, height },
      entities: { players: [], bullets: [] },
    } as GameState;
  }
  
  static update(prev: GameState, input: InputState) {
    console.log(this.init());
    console.log(input);
  }
}