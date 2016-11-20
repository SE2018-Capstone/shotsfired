import { Player, PlayerState } from './player';
import { Bullet, BulletState } from './bullet';
import { EntityState, Entity } from './entity';
import { Event } from './event';

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  angle: number;
  fired: boolean;
  duration: number;
  playerId: string;
  timestamp: number; // Used for client-server synchronization
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    players: {[id:string]:PlayerState};
    bullets: {[id:string]:BulletState};
  };
  settings: {
    minPlayers: number;
    maxPlayers: number;
  };
  isFinished: boolean;
};

export class Game {
  static settings = { minPlayers: 2, maxPlayers: 4 };
  static init(overrides: any = {}) {
    return Object.assign({
      settings: { minPlayers: Game.settings.minPlayers,
                  maxPlayers: Game.settings.maxPlayers },
      world: { width: 640, height: 480 },
      entities: { players: {}, bullets: {} },
      isFinished: false
    }, overrides) as GameState;
  }

  // Current issue is that the state that the parts base their
  // information of is changing as they're all running, so behavior
  // might change based on the order of iteration, which is bad.
  // Immutability is the only way to fix this
  static update(game: GameState, delta: number) {

    let {players, bullets} = game.entities;

    let events: Event[] = [];

    Object.keys(game.entities).forEach(entityType => {
      let entities = (game.entities as any)[entityType] as {[s: string]: EntityState};
      Object.keys(entities).forEach(id => {
        if (!entities[id].alive) { delete entities[id]; }
      });
    });

    // Consider putting all entities together
    events = Object.keys(players).reduce((events, playerId) => {
      return events.concat(Player.update(players[playerId], delta, game));
    }, events);

    events = Object.keys(bullets).reduce((events, bulletId) => {
      return events.concat(Bullet.update(bullets[bulletId], delta, game));
    }, events);

    return events;
  }

  static applyInputs(state: GameState, inputs: InputFrame[]) {
    const players = state.entities.players;

    var events: Event[] = [];
    inputs.forEach(input => {
      if (!players[input.playerId]) { return; }
      events = events.concat(Player.applyInput(players[input.playerId], input, state));
    });

    return events;
  }

  static resolveEvents(game: GameState, events: Event[]) {
    let { players, bullets }  = game.entities;

    events.forEach(event => {
      let sender = players[event.initiator] || bullets[event.initiator] || null;
      let receiver = players[event.receptor] || bullets[event.receptor] || null;
      switch(event.type) {
        case 'COLLISION':
          switch(sender.type) {
            case 'player': Player.collideWith(sender, receiver, game); break;
            case 'bullet': Bullet.collideWith(sender, receiver, game); break;
          }
          break;
        case 'SPAWN_BULLET':
          switch(sender.type) {
            case 'player':
              let bullet = Bullet.spawnFrom(sender);
              bullets[bullet.id] = bullet;
              break;
          }
          break;
      }
    });
  }

  static isFinished(game: GameState) {
    const players = game.entities.players;
    let playersAlive = Object.keys(players).length;

    Object.keys(players).forEach(id => {
      if (!players[id].alive) {
        playersAlive--;
      }
    });
    return (playersAlive === 1);

  }

  static getWinner(game: GameState) {
    const players = game.entities.players;
    let winner = "";

    if (Game.isFinished(game)) {
      game.isFinished = true;
      Object.keys(players).forEach(id => {
        if (players[id].alive) {
          winner = id;
        }
      });
    }
    return winner;
  }

  // static getWinner(game: GameState) {
  //   const players = game.entities.players;
  //   let playersAlive = Object.keys(players).length;
  //   let winner: string;

  //   Object.keys(players).forEach(id => {
  //     if (!players[id].alive) {
  //       playersAlive--;
  //     }
  //     else {
  //       winner = id;
  //     }
  //   });
  //   return (playersAlive === 1) ? winner : "";
  // }

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
