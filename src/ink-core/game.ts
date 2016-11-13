import { Bullet, BulletState } from './bullet'
import { Event } from '../ink-core/event';

export interface InputFrame {
  down: boolean;
  mouseX: number;
  mouseY: number;
  duration: number;
  playerId: string;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    bullets: {[id:string]:BulletState}
    players: {[id:string]:string}
  }
  settings: {
    maxPlayers: number;
  };
};

let lastId = 0;

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480 },
      entities: { bullets: {}, players: {} },
      settings: { maxPlayers: 4 }
    }, overrides) as GameState;
  }

  static update(game: GameState, delta: number): Event[] {
    let {bullets, players} = game.entities;
    let events: Event[] = [];


    // events = Object.keys(bullets).reduce((events, bulletId) => {
    //   return events.concat(Bullet.update(bullets[bulletId], delta, game));
    // }, events);
  
    return events;
  }

  static applyInputs(state: GameState, inputs: InputFrame[]): Event[] {
    var events: Event[] = [];
    let { bullets, players } = state.entities;

    inputs.forEach(input => {
      if (input.down) {
        let bullet = Bullet.init();
        bullet.pos = {x: input.mouseX, y: input.mouseY};
        bullets[bullet.id] = bullet;
      }
      events = events.concat();
    });

    return events;
  }

  static resolveEvents(game: GameState, events: Event[]): void {
  }


  static addPlayer(state: GameState) {
    let player = "" + lastId++;
    // let player = Player.init();
    // player.pos.x = state.world.width / 2;
    // player.pos.y = state.world.height / 2;
    state.entities.players[player] = player;
    return player;
  }

  static removePlayer(state: GameState, playerId: string) {
    delete state.entities.players[playerId];
  }

}
