// import { EntityState, Entity } from './entity'
import { Game, GameState, InputFrame }  from './game'
// import { EventFactory, Event } from './event'
// import { Player, PlayerState } from './player';
import { Vec, Vector } from './vector';

export interface BulletState {
  damage: number;
  source: string;
  // type: 'bullet';
  pos: Vector;
  vel: Vector;
  accel: Vector;
  // inputVel: Vector; // The velocity due to user input
  orientation: number; // angle in radians
  radius: number; // Collision hitbox
  id: string;
  alive: boolean;
  type: string;
  sprite: Phaser.Sprite;
};

let lastId = 0;
const BULLET_SPEED = 300;
export class Bullet {

  static init(overrides: any = {}) {
    return Object.assign({
      damage: 15,
      source: null,
      alive: true,
      type: 'bullet',
      id: ("" + lastId++),
      pos: {x: 640, y: 320},
      sprite: null
    }, overrides) as BulletState;
  }

  static update(bullet: BulletState, delta: number, game: GameState) {
    let events: Event[] = []
    // return super.update(bullet, delta, game);
    return events;
  }

  public static applyInput(bullet: BulletState, input: InputFrame, game: GameState) {
    // if (input.playerId !== player.id) { return; }

    // // Controls
    // const step = (input.duration / 1000) * INPUT_VEL;
    // const inputVel = {x: 0, y: 0};

    // if (input.up) { inputVel.y -= step; }
    // if (input.down) { inputVel.y += step; }
    // if (input.left) { inputVel.x -= step; }
    // if (input.right) { inputVel.x += step; }

    // player.orientation = input.angle;
    // player.pos.x += inputVel.x;
    // player.pos.y += inputVel.y;

    let events: any = [];
     // TODO: Investigate whether this Date.now business messes up with server
    // if (input.fired && player.lastFire + player.gunCooldown < Date.now()) {
    //   player.lastFire = Date.now();
    //   events.push(EventFactory.createEvent('SPAWN_BULLET', player.id, null));
    // }
    return events;
  }


  // static collideWith(bullet: BulletState, other: EntityState, state: GameState) {
  //   switch(other.type) {
  //     case 'player':
  //       other = other as PlayerState;
  //       if (other.id !== bullet.source) {
  //         Player.takeDamage(other as PlayerState, bullet.damage);
  //         bullet.alive = false;
  //       }
  //       break;
  //   }
  // }

  // static spawnFrom(entity: EntityState) {
  //   let base = Bullet.init();
  //   base.source = entity.id;
  //   base.pos = {x: entity.pos.x, y: entity.pos.y};
  //   base.vel = Vec.mul(Vec.direction(entity.orientation), BULLET_SPEED);
  //   return base;
  // }
}
