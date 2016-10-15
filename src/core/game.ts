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

export module Game {
  export function init(width: number = 640, height: number = 480) {
    return {
      world: { width, height },
      entities: { players: [], bullets: [] },
    } as GameState;
  }
  
  export function update(delta: number, input: InputState) {
    console.log(init());
    console.log(input, delta);
  }
}