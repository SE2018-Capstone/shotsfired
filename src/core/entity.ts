import Vec = require('victor');

export interface EntityState {
  pos: Vec;
  vel: Vec;
  accel: Vec;
  orientation: Vec;
  radius: number;
};

export module Entity {
  export function init(pos: Vec = new Vec(0, 0), radius: number = 10) {
    return {
      pos: new Vec(0, 0),
      vel: new Vec(0, 0),
      accel: new Vec(0, 0),
      orientation: new Vec(0, 0),
      radius,
    };
  }
}