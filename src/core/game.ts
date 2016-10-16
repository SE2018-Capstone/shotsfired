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
  playerId: string;
};


export interface GameState {
  world: {
    width: number;
    height: number;
    maxPlayers: 4;
  };
  entities: {
    players: {[s: string]: PlayerState};
    bullets: BulletState[];
  };
};

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480, maxPlayers: 4 },
      entities: { players: {}, bullets: [] },
    }, overrides) as GameState;
  }

  // Current issue is that the state that the parts base their
  // information of is changing as they're all running, so behavior
  // might change based on the order of iteration, which is bad.
  // Immutability is the only way to fix this
  static update(state: GameState, delta: number) {

    // process inputs

    // events

    let events: any[] = [];
    let players = state.entities.players;
    Object.keys(players).filter((p:string) => !!p).forEach((id:string) => {
      events = events.concat(
        Player.update(players[id], delta, state)
      );
    }, []);

    return events;
  }

  static applyInputs(state: GameState, inputs: InputFrame[]) {
    const players = state.entities.players;
    var events: any[] = []; // switch to eventarray
    inputs.forEach(input => {
      if (!players[input.playerId]) { return; }
      events = events.concat(Player.applyInput(players[input.playerId], input, state));
    });

    return events;
  }

  static addPlayer(state: GameState) {
    let player = Player.init();
    player.pos.x = state.world.width / 2;
    player.pos.y = state.world.height / 2;
    state.entities.players[player.id] = player;
    return player;
  }

  static removePlayer(state: GameState, playerId: string) {
    delete state.entities.players[playerId];
  }
}