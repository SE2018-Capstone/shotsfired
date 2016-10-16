import Vec = require('victor');
import { GameState, InputState } from './game';

export interface EntityState {
  pos: Vec;
  vel: Vec;
  inputVel: Vec;
  accel: Vec;
  orientation: Vec;
  radius: number;
};

export class Entity {
  static init(overrides: any = {}) {
    return Object.assign({
      pos: new Vec(640, 320),
      vel: new Vec(0, 0),
      accel: new Vec(0, 0),
      inputVel: new Vec(0, 0),
      orientation: new Vec(0, 0),
      radius: 10,
    }, overrides);
  }

  static update(entity: EntityState, input: InputState, game: GameState) {
  }
}