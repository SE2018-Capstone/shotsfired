import { Bullet, BulletState } from './bullet'
import { Player, PlayerState } from './player'
import { Event, EventFactory } from './event';

export interface InputFrame {
  down: boolean;
  mouseX: number;
  mouseY: number;
  duration: number;
  playerId: string;
  reset: boolean;
  guess: string;
  score: number;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    bullets: {[id:string]:BulletState}
    players: {[id:string]:PlayerState}
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
      if (input.guess !== "") {
        let player = players[input.playerId];
        player.guess = input.guess;
      }
      if (input.score !== 0) {
        let player = players[input.playerId];
        player.score += input.score;
        events = events.concat(this.resetGuesses(state));
      }
    });

    if (willReset) {
      //just for verifying object contains guess
      Object.keys(players).forEach(id => {
        let player = players[id];
        console.log("Player " + id + "'s guess is: " + player.guess);
      })

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
    let {players} = game.entities;
    events.forEach(event => {
      let sender = players[event.initiator] || null;
      let receiver = players[event.receptor] || null;
      switch (event.type) {
        case "NEW_DRAWER":
          Player.setDrawer(sender, false);
          Player.setDrawer(receiver, true);
      }
    })
  }

  static resetGuesses(game: GameState): Event[] {
    let {players} = game.entities;
    let events: Event[] = [];

    Object.keys(players).forEach(id => {
      events = events.concat(Player.resetGuess(players[id], Object.keys(players).length));
    })

    return events;
  }

  static addPlayer(state: GameState) {
    // let player = "" + lastId++;
    let player = Player.init();
    if (player.id === "0") {
      player.isDrawer = true;
    }

    // player.pos.x = state.world.width / 2;
    // player.pos.y = state.world.height / 2;
    state.entities.players[player.id] = player;
    console.log("player id is: " + player.id);
    return player;
  }

  static removePlayer(state: GameState, playerId: string) {
    delete state.entities.players[playerId];
  }

}
