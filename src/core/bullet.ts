import Vec = require('victor');
import { EntityState, Entity } from './entity'
import { Game, GameState, InputFrame }  from './game'
import { EventFactory } from './event'

export interface BulletState extends EntityState {
    damage: number;
    source: number;
};

export class Bullet extends Entity {
    
    static init(overrides: any = {}) {
    return Object.assign(super.init(), {
        damage: 1,
        source: -1,
      }, overrides) as BulletState;
    }
    
    static update(bullet: BulletState, input: InputFrame, state: GameState){
        super.update(bullet, input, state);
        bullet.pos.add(bullet.vel); 
        let events: any = []; 
        events.concat(
            Game.applyEventCheck(state, bullet.id, (other:EntityState) => {
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