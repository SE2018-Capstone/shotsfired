import { Entity, EntityState } from './entity';
import { InputState, GameState } from './game';

export interface PlayerState extends EntityState {
  health: number;
  id: number;
}

const INPUT_VEL = 200;
var lastId = 0;
export class Player extends Entity {
  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      health: 10,
      id: lastId++,
    }, overrides) as PlayerState;
  }

  static update(player: PlayerState, input: InputState, game: GameState) {
    super.update(player, input, game);

    if (player.id === game.activePlayer) {
      this.handleControls(player, input);
    }
  }

  private static handleControls(player: PlayerState, input: InputState) {
    // Controls
    const step = (input.duration / 1000) * INPUT_VEL;
    if (input.up) { player.pos.y -= step; }
    if (input.down) { player.pos.y += step; }
    if (input.left) { player.pos.x -= step; }
    if (input.right) { player.pos.x += step; }
  }
}