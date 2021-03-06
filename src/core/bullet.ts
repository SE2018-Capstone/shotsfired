import { EntityState, Entity } from './entity';
import { GameState }  from './game';
import { Player, PlayerState, GUNPOINT_OFFSETS } from './player';
import { Vec } from './vector';

export interface BulletState extends EntityState {
  damage: number;
  source: string;
  type: 'bullet';
};

const BULLET_SPEED = 300;
export class Bullet extends Entity {

  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      damage: 15,
      source: null,
      alive: true,
      type: 'bullet',
    }, overrides) as BulletState;
  }

  static update(bullet: BulletState, delta: number, game: GameState){
    if (bullet.pos.x < 0 - bullet.radius
       || bullet.pos.x > game.world.width + bullet.radius
       || bullet.pos.y < 0 - bullet.radius
       || bullet.pos.y > game.world.height + bullet.radius) {
         bullet.alive = false;
    }
    return super.update(bullet, delta, game);
  }

  static collideWith(bullet: BulletState, other: EntityState, state: GameState) {
    switch(other.type) {
      case 'player':
        other = other as PlayerState;
        if (other.id !== bullet.source && bullet.alive) {
          Player.takeDamage(other as PlayerState, bullet.damage);
          bullet.alive = false;
        }
        break;
      case 'wall':
        bullet.alive = false;
        break;
    }
  }

  static spawnFrom(entity: EntityState) {
    let base = Bullet.init();
    base.source = entity.id;
    let directionVector = Vec.direction(entity.orientation);
    let { center, distance } = GUNPOINT_OFFSETS;
    base.pos = {
      x: entity.pos.x + distance.x*directionVector.x - distance.y * directionVector.y - center.x,
      y: entity.pos.y + distance.y*directionVector.y + distance.y * directionVector.x - center.y,
    };
    base.vel = Vec.mul(directionVector, BULLET_SPEED);
    return base;
  }
}
