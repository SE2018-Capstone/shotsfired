import { Player, PlayerState } from './player';
import { Bullet, BulletState } from './bullet';
import { EntityState, Entity } from './entity';
import { WallState, MapCatalog, Wall } from './wall';
import { Event } from './event';
import * as _ from 'lodash'

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
    walls: {[id:string]: WallState};
  };
  settings: {
    minPlayers: number;
    maxPlayers: number;
  };
  isFinished: boolean;
};

const defaultMap = MapCatalog[0].reduce((prev, wallData) => {
  const wallEntity: WallState = Wall.init(wallData);
  (prev as any)[wallEntity.id] = wallEntity;
  return prev;
}, {});

export class Game {
  static settings = { minPlayers: 2, maxPlayers: 4 };
  static init(overrides: any = {}) {
    const defaults: GameState = {
      settings: { minPlayers: Game.settings.minPlayers,
                  maxPlayers: Game.settings.maxPlayers },
      world: { width: 960, height: 720 },
      entities: { players: {}, bullets: {}, walls: defaultMap },
      isFinished: false
    };
    return Object.assign(defaults, overrides) as GameState;
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
    let allEntities: {[id:string]: EntityState} = Object.keys(game.entities).reduce((list, key) => {
      Object.assign(list, (game.entities as any)[key]);
      return list;
    }, {});

    events.forEach(event => {
      let sender = allEntities[event.initiator];
      let receiver = allEntities[event.receptor];
      switch(event.type) {
        case 'COLLISION':
          switch(sender.type) {
            case 'player': Player.collideWith(sender as PlayerState, receiver, game); break;
            case 'bullet': Bullet.collideWith(sender as BulletState, receiver, game); break;
          }
          break;
        case 'SPAWN_BULLET':
          switch(sender.type) {
            case 'player':
              let bullet = Bullet.spawnFrom(sender as PlayerState);
              game.entities.bullets[bullet.id] = bullet;
              break;
          }
          break;
      }
    });
  }

  static setIsFinished(game: GameState) {
    game.isFinished = _.size(_.filter(game.entities.players, p => p.alive)) === 1;
  }

  static getWinner(game: GameState) {
    return _.find(game.entities.players, p => p.alive).id;
  }

  static addPlayer(state: GameState) {
    let player = Player.init();
    let count = 0;
    if (state.entities.players) {
      count = Object.keys(state.entities.players).length;
    }
    player.pos.x = state.world.width / 4;
    if ( (count + 1) % 2 === 0) {
      player.pos.x = player.pos.x + state.world.width / 2;
    }
    player.pos.y = state.world.height / 4;
    if (count > 1) {
      player.pos.y = player.pos.y + state.world.height/2;
    }
    state.entities.players[player.id] = player;
    return player;
  }

  static removePlayer(state: GameState, playerId: string) {
    delete state.entities.players[playerId];
  }
}
