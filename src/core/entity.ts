import { GameState, InputFrame } from './game';

export interface Vector {
  x: number;
  y: number;
}

// TODO: Move this out probably
export class Vec {
  static add (a: Vector, b: Vector) {
    return {x: a.x + b.x, y: a.y + b.y} as Vector;
  }

  static create(x: number, y: number) {
    return {x, y};
  }

  static mul(v: Vector, scale: number) {
    return {x: v.x * scale, y: v.y * scale};
  }
}

export interface EntityState {
  pos: Vector;
  vel: Vector;
  accel: Vector;
  // inputVel: Vector; // The velocity due to user input
  orientation: Vector; // Unit vector
  radius: number; // Collision hitbox
};

export class Entity {
  static init(overrides: any = {}) {
    return Object.assign({
      pos: {x: 640, y: 320},
      vel: {x: 0, y: 0},
      accel: {x: 0, y: 0},
      orientation: {x: 0, y: 0},
      radius: 10,
    }, overrides);
  }

  static update(entity: EntityState, delta: number, game: GameState) {
    entity.vel = Vec.add(entity.vel, entity.accel);
    entity.pos = Vec.add(entity.pos, Vec.mul(entity.vel, delta / 1000));
  }
}