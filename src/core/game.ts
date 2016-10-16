import { Player, PlayerState } from './player';
import { Bullet, BulletState } from './bullet';
import { EntityState, Vec } from './entity'
import { Event } from './event'

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
    players: {[id:string]:PlayerState}
    bullets: {[id:string]:BulletState}
  };
};

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480, maxPlayers: 4 },
      entities: { players: {}, bullets: [] },
    }, overrides) as GameState;
  }

  static getEntity(entityId: string, state: GameState) {
    let { players, bullets } = state.entities;
    if (entityId in players) {
      return players[entityId];
    }
    else if (entityId in bullets) {
      return bullets[entityId];
    }
    return null;
  }

  static interactionsCheck(state: GameState, callerId: string, interactions: (other:EntityState) => Event[]){
     let eventList: any = []
     let { players, bullets } = state.entities;
     let otherEntities = Object.keys(players).concat(Object.keys(bullets)).filter(id => id !== callerId);
     let events = otherEntities.reduce((events, entityId) => {
          let entity = Game.getEntity(entityId, state);
          return events.concat(interactions(entity))
        }, eventList);
     return events;
  }

  // Current issue is that the state that the parts base their
  // information of is changing as they're all running, so behavior
  // might change based on the order of iteration, which is bad.
  // Immutability is the only way to fix this
  static update(state: GameState, delta: number) {

    // process inputs

    // events

    let events: any = [];
    Object.keys(state.entities.players).forEach(playerId => {
      events = events.concat(
        Player.update(state.entities.players[playerId], delta, state)
      );
    });

    Object.keys(state.entities.bullets).forEach(bulletId => {
      events = events.concat(
        Bullet.update(state.entities.bullets[bulletId], delta, state)
      );
    });

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

  static resolveEvents(events: Event[], state: GameState) {
    let { players, bullets }  = state.entities;
    events.forEach(event => {
      if (event.type == "COLLISION") {
        if (event.initiator in Object.keys(bullets)){
          if (event.receptor in Object.keys(players) && bullets[event.initiator].source != event.receptor) {
            Player.collidesWithBullet(players[event.receptor], bullets[event.initiator].damage);
            delete state.entities.bullets[event.initiator];
          }
        }
      }
      else if (event.type == "SPAWN_BULLET") {
        let v = new Vec(1, 1);
        v.rotateBy(players[event.initiator].angle);
        let gun_speed = players[event.initiator].gun_speed;
        v.multiply(v, gun_speed);
        let bullet = Bullet.init({
          source: event.initiator,
          vel: v,
        });
        bullet.pos.x = players[event.initiator].pos.x;
        bullet.pos.y = players[event.initiator].pos.y;
        state.entities.bullets[bullet.id] = bullet;
      }
    });
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
