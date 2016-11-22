import { Player, PlayerState, PlayerMovement } from './player';
import { Bullet, BulletState } from './bullet';
import { EntityState, Entity } from './entity';
import { WallState, MapCatalog, Wall, BorderWalls } from './wall';
import { Event } from './event';
import * as _ from 'lodash';

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
  winner: string;
};

export const WorldSize = { width: 960, height: 720 };

const defaultMap = MapCatalog[0].walls.concat(BorderWalls(WorldSize)).reduce((prev, wallData) => {
  const wallEntity: WallState = Wall.init(wallData);
  (prev as any)[wallEntity.id] = wallEntity;
  return prev;
}, {});

export class Game {
  static settings = { minPlayers: 2, maxPlayers: 4 };
  static init(overrides: any = {}) {
    let defaults: GameState = {
      settings: { minPlayers: Game.settings.minPlayers,
                  maxPlayers: Game.settings.maxPlayers },
      world: WorldSize,
      entities: { players: {}, bullets: {}, walls: defaultMap },
      isFinished: false,
      winner: null,
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
        if (!entities[id].alive && entityType !== 'players') { delete entities[id]; }
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
      if (!_.get(players[input.playerId], 'alive', null)) { return; }
      events = events.concat(Player.applyInput(players[input.playerId], input, state));
    });

    return events;
  }

  static resolveEvents(game: GameState, events: Event[]) {
    let allEntities: {[id:string]: EntityState} = Object.keys(game.entities).reduce((list, key) => {
      Object.assign(list, (game.entities as any)[key]);
      return list;
    }, {});
    let { walls, players }  = game.entities;

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
        case 'MOVEMENT':
          if (sender) {
            let movementData = event.data as PlayerMovement;
            Player.move(sender as PlayerState, movementData.xVel, movementData.yVel);
            let foundCollision = !!_.find(walls, wall => Entity.colliding(sender, wall))
                  || !!_.find(players, (player, playerId) => Entity.colliding(sender, player) && sender.id !== playerId);
            if (foundCollision) {
              Player.move(sender as PlayerState, movementData.xVel*-1, movementData.yVel*-1);
            }
          }
          break;
      }
    });
  }

  static setIsFinished(game: GameState) {
    game.isFinished = !!game.winner || _.size(_.filter(game.entities.players, p => p.alive)) <= 1;
    if (game.isFinished) { game.winner = game.winner || _.get(_.find(game.entities.players, p => p.alive), 'id', null); }
  }

  static getWinner(game: GameState) {
    return game.winner;
  }

  static addPlayer(game: GameState) {
    let player = Player.init();
    let count = 0;
    if (game.entities.players) {
      count = Object.keys(game.entities.players).length;
    }
    player.pos = MapCatalog[0].startPositions[count];
    game.entities.players[player.id] = player;
    return player;
  }

  static removePlayer(game: GameState, playerId: string) {
    delete game.entities.players[playerId];
  }
}
