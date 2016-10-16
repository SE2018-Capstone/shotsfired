import { Player, PlayerState } from './player';
import { Bullet, BulletState } from './bullet';
import { EntityState } from './entity'

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  angle: number;
  fired: boolean;
  duration: number;
  playerId: number;
  localTime: number;
};


export interface GameState {
  world: {
    width: number;
    height: number;
  };
  entities: {
    playerIds: number[];
    bulletIds: number[];
    players: {[id:number]:PlayerState}
    bullets: {[id:number]:BulletState}
  };
};

export class Game {
  static init(overrides: any = {}) {
    return Object.assign({
      world: { width: 640, height: 480 },
      entities: { playerIds: [], bulletIds: [], players: {}, bullets: {} },
      activePlayer: null
    }, overrides) as GameState;
  }
  
  static applyEventCheck(state: GameState, callerId: number, application: (other:EntityState) => Event[]){
     let events: any = []
     state.entities.playerIds.forEach(playerId => {
       if (playerId != callerId) {
         events.concat(application(state.entities.players[playerId]));
       }
     });
     state.entities.bulletIds.forEach(bulletId => {
       if (bulletId != callerId) {
        events.concat(application(state.entities.bullets[bulletId])); 
       }
     });
     return events;
  }

  // Current issue is that the state that the parts base their
  // information of is changing as they're all running, so behavior
  // might change based on the order of iteration, which is bad.
  // Immutability is the only way to fix this
  // static update(state: GameState, input: InputFrame) {
  static update(state: GameState, input: InputFrame) {

    // process inputs

    // events

    let events: any = [];
    state.entities.playerIds.forEach(playerId => {
      events.concat(
        Player.update(state.entities.players[playerId], input, state)
      );
    });
    
    state.entities.bulletIds.forEach(bulletId => {
      events.concat(
        Bullet.update(state.entities.bullets[bulletId], input, state)
      );
    });

  }
  
  static resolveEvents(events: Event[], state: GameState) {
    events.forEach(event => {
      if (event.type == "COLLISION") {
        if (event.initiator in state.entities.bulletIds){
          if (event.receptor in state.entities.playerIds) {
            Player.collidesWithBullet(state.entities.players[event.receptor], state.entities.bullets[event.initiator].damage);
          }
        }
      }
    }) 
  }

  static addPlayer(state: GameState) {
    let player = Player.init();
    player.pos.x = state.world.width / 2;
    player.pos.y = state.world.height / 2;
    state.entities.playerIds.push(player.id);
    state.entities.players[player.id] = player; 
    return player;
  }
}