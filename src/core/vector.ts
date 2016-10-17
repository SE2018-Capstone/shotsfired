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
    return Vec.add(a, {x: -b.x, y: -b.y});
  }

  static mul(v: Vector, scale: number) {
    return {x: v.x * scale, y: v.y * scale};
  }

  static mag(v: Vector) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static direction(angle: number) {
    return {x: Math.cos(angle), y: Math.sin(angle)};
  }
}