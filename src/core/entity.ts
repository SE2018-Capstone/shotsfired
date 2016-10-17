import { Game, GameState, InputFrame } from './game';
import { Event, EventFactory } from './event';
import { Vec, Vector } from './vector';

export interface EntityState {
  pos: Vector;
  vel: Vector;
  accel: Vector;
  // inputVel: Vector; // The velocity due to user input
  orientation: number; // angle in radians
  radius: number; // Collision hitbox
  id: string;
  alive: boolean;
  type: string;
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
      alive: true,
      id: ("" + lastId++),
    }, overrides);
  }

  static getEntities(game: GameState) {
    return Object.keys(game.entities).reduce((fullList: Entity[], entityType: string) => {
      let entities = (game.entities as any)[entityType];
      return fullList.concat(Object.keys(entities).map(e => entities[e])) as Entity[];
    }, []);
  }

  // TODO: Make this able to keep players running if they were running
  // We need player input to be able to be inputted normally, but extrapolated when only simulated?
  static update(entity: EntityState, delta: number, game: GameState) {
    entity.vel = Vec.add(entity.vel, entity.accel);

    entity.pos = Vec.add(entity.pos, Vec.mul(entity.vel, delta / 1000));

    let events: Event[] = [];
    Entity.getEntities(game).forEach((other: EntityState) => {
      if (other.id !== entity.id && Entity.colliding(entity, other)) {
        events.push(EventFactory.createEvent('COLLISION', entity.id, other.id));
      }
    });
    return events;
  }

  static colliding(verifier: EntityState, other: EntityState) {
    return Vec.mag(Vec.subtract(verifier.pos, other.pos)) < Math.min(verifier.radius, other.radius);
  }

  static interact(entity: EntityState, other: EntityState, state: GameState) {
    return;
  }
}
