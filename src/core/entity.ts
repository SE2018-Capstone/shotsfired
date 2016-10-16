import Vec = require('victor');
import { GameState, InputFrame } from './game';

export interface EntityState {
  pos: Vec;
  vel: Vec;
  accel: Vec;
  inputAccel: Vec; // The acceleration due to user input
  orientation: Vec; // Unit vector
  radius: number; // Collision hitbox
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

  static update(entity: EntityState, input: InputFrame, game: GameState) {
  }
}