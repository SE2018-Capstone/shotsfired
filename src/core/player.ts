import { Entity, EntityState } from './entity';
import { InputFrame, GameState } from './game';

export interface PlayerState extends EntityState {
  health: number;
}

const INPUT_VEL = 200;
export class Player extends Entity {
  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      health: 10,
    }, overrides) as PlayerState;
  }

  static update(player: PlayerState, input: InputFrame, game: GameState) {
    super.update(player, input, game) 
    if (player.id === input.playerId) {
      this.handleControls(player, input);
    }
    let events: any = []
    return events;
  }

  private static handleControls(player: PlayerState, input: InputFrame) {
    // Controls
    const step = (input.duration / 1000) * INPUT_VEL;
    if (input.up) { player.pos.y -= step; }
    if (input.down) { player.pos.y += step; }
    if (input.left) { player.pos.x -= step; }
    if (input.right) { player.pos.x += step; }
  }
  
  static collidesWithBullet(player: PlayerState, dmg: number) {
    player.health = player.health - dmg; 
  }
}