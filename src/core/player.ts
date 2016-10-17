import { Entity, EntityState } from './entity';
import { InputFrame, GameState } from './game';
import { EventFactory } from './event'

export interface PlayerState extends EntityState {
  health: number;
  type: 'player';
  gunCooldown: number;
  lastFire: number;
}

const INPUT_VEL = 200;
export class Player extends Entity {
  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      health: 10,
      gunCooldown: 200,
      lastFire: 0,
      type: 'player',
    }, overrides) as PlayerState;
  }

  static update(player: PlayerState, delta: number, game: GameState) {
    return super.update(player, delta, game);
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
    if (input.fired && player.lastFire + player.gunCooldown < Date.now()) {
      player.lastFire = Date.now();
      events.push(EventFactory.createEvent('SPAWN_BULLET', player.id, null));
    }
    return events;
  }

  static takeDamage(player: PlayerState, dmg: number) {
    player.health = player.health - dmg;
    if (player.health < 0) { player.alive = false; }
  }

  static collideWith(player: PlayerState, other: EntityState, game: GameState) {
    return;
  }

}
