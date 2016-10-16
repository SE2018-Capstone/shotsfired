import { EntityState, Entity, Vec } from './entity'
import { Game, GameState, InputFrame }  from './game'
import { EventFactory } from './event'

export interface BulletState extends EntityState {
  damage: number;
  source: string;
  key: 'bullet';
};

export class Bullet extends Entity {

  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      damage: 1,
      source: null,
    }, overrides) as BulletState;
  }

  static update(bullet: BulletState, delta: number, state: GameState){
    super.update(bullet, delta, state);
    bullet.pos = Vec.add(bullet.pos, bullet.vel);
    let events: any = [];
    events = events.concat(
      Game.interactionsCheck(state, bullet.id, (other:EntityState) => {
        let innerEventList: any = [];
        if (Entity.colliding(bullet, other)) {
          innerEventList.push(
            EventFactory.createEvent("COLLISION", bullet.id, other.id)
          );
        }
        return innerEventList;
      })
    );
    return events;
  }
}
