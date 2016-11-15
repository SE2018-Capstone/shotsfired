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
const DEFAULT_GUESS = "default-null";
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
      if (players[input.playerId].isDrawer) {
        if (input.reset) {
          willReset = true;        
        }
        if (input.down) {
          let bullet = Bullet.init();
          bullet.pos = {x: input.mouseX, y: input.mouseY};
          bullets[bullet.id] = bullet;
        }
      }
      if (input.guess !== DEFAULT_GUESS) {
        let player = players[input.playerId];
        player.guess = input.guess;
      }
      if (input.score !== 0) {
        let player = players[input.playerId];
        willReset = true;
        player.score += input.score;
        player.isDone = (player.score === 500);
        // console.log(player.isDone);
        events = events.concat(this.resetGuesses(state, player.isDone));
      }
    });

    if (willReset) {
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
        case "GAMEOVER":
          Player.setGameOver(receiver);
      }
    })
  }

  static resetGuesses(game: GameState, isGameOver: boolean): Event[] {
    let {players} = game.entities;
    let events: Event[] = [];

    Object.keys(players).forEach(id => {
      events = events.concat(Player.resetGuess(players[id], Object.keys(players).length));
      if (isGameOver) {
        events.push(EventFactory.createEvent("GAMEOVER", null, id))
      }
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
