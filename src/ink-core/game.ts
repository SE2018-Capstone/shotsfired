import { Bullet, BulletState } from './bullet'
import { Event } from '../ink-core/event';

export interface InputFrame {
  down: boolean;
  mouseX: number;
  mouseY: number;
  duration: number;
  playerId: string;
  reset: boolean;
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
    let willReset = false;

    inputs.forEach(input => {
      if (input.reset) {
        willReset = true;        
      }
      if (input.down) {
        let bullet = Bullet.init();
        bullet.pos = {x: input.mouseX, y: input.mouseY};
        bullets[bullet.id] = bullet;
      }
      events = events.concat();
    });

    if (willReset) {
      Object.keys(bullets).forEach(id => {
        let bullet = bullets[id];
        // bullet.image.alive = false;
        // bullet.image.exists = false;
        if (bullet.image) {
          console.log("destroying...");
          bullet.image.destroy();
        }
        else if (bullet.image !== null) {
          console.log("not null destroying...");
          bullet.image.destroy();
        }
        else if (bullet.hasImage) {
          console.log("has image destroying...");
          bullet.image.destroy();
        }
                
      })
      state.entities.bullets = {};
      Bullet.reset();
    }

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
