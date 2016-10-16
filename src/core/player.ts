import { Entity, EntityState } from './entity';
import { InputFrame, GameState } from './game';
import { EventFactory } from './event'

export interface PlayerState extends EntityState {
  health: number;
  gun_speed: number;
  key: 'player';
}

const INPUT_VEL = 200;
export class Player extends Entity {
  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      health: 10,
      angle: 0,
      gun_speed: 10,
    }, overrides) as PlayerState;
  }

  static update(player: PlayerState, delta: number, game: GameState) {
    super.update(player, delta, game);
    let events: any = []
    return events;
  }

  public static applyInput(player: PlayerState, input: InputFrame, game: GameState) {
    if (input.playerId !== player.id) { return; }

    // Controls
    const step = (input.duration / 1000) * INPUT_VEL;
    const inputVel = {x: 0, y: 0};

    if (input.up) { inputVel.y -= step; }
    if (input.down) { inputVel.y += step; }
    if (input.left) { inputVel.x -= step; }
    if (input.right) { inputVel.x += step; }

    player.orientation = input.angle;
    player.pos.x += inputVel.x;
    player.pos.y += inputVel.y;
    let events: any = [];
    if (input.fired) {
      events.push(EventFactory.createEvent("SPAWN_BULLET", player.id, null))
    }
    return events;
  }

  static collidesWithBullet(player: PlayerState, dmg: number) {
    player.health = player.health - dmg;
  }
}
