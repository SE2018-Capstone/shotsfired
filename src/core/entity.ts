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

  static subtract(a: Vector, b: Vector){
    return {x: a.x - b.x, y: a.y - b.y} as Vector;
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
  orientation: number; // angle in radians
  radius: number; // Collision hitbox
  id: string;
  key: string;
};

let lastId = 0;

export class Entity {
  static init(overrides: any = {}) {
    return Object.assign({
      pos: {x: 640, y: 320},
      vel: {x: 0, y: 0},
      accel: {x: 0, y: 0},
      orientation: 0,
      radius: 10,
      id: (lastId++).toString(),
    }, overrides);
  }

  // TODO: Make this able to keep players running if they were running
  // We need player input to be able to be inputted normally, but extrapolated when only simulated?
  static update(entity: EntityState, delta: number, game: GameState) {
    entity.vel = Vec.add(entity.vel, entity.accel);
    entity.pos = Vec.add(entity.pos, Vec.mul(entity.vel, delta / 1000));
  }

  static colliding(verifier: EntityState, other: EntityState) {
    return verifier.pos.subtract(other.pos).length() < Math.min(verifier.radius, other.radius)
  }
}
