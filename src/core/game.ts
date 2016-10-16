import { Player, PlayerState } from './player';
import { BulletState } from './bullet';

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  angle: number;
  fired: boolean;
  duration: number;
  playerId: number;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    players: PlayerState[];
    bullets: BulletState[];
  };
};

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480 },
      entities: { players: [], bullets: [] },
      activePlayer: null
    }, overrides) as GameState;
  }

  // Current issue is that the state that the parts base their
  // information of is changing as they're all running, so behavior
  // might change based on the order of iteration, which is bad.
  // Immutability is the only way to fix this
  static update(state: GameState, input: InputFrame) {

    // process inputs

    // events

    let events: any = [];
    state.entities.players.forEach(player => {
      events.concat(
        Player.update(player, input, state)
      );
    });

  }

  static addPlayer(state: GameState) {
    let player = Player.init();
    player.pos.x = state.world.width / 2;
    player.pos.y = state.world.height / 2;
    state.entities.players.push(player);
    return player;
  }
}