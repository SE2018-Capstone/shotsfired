 import { EntityState, Entity } from './entity';
 import { GameState } from './game';
 
 export interface WallState extends EntityState{
  width: number;
  height: number;
  variant: string;
}
export interface Map {[id:string]: WallState};

export class Wall extends Entity {
  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      damage: 0,
      source: null,
      alive: true,
      radius: 0,
      height: 140,
      width: 70,
      variant: '1',
      type: 'wall',
    }, overrides) as WallState;
  }

  static update(wall: WallState, delta: number, game: GameState){
    return super.update(wall, delta, game); 
  }
}

// function wall(x:number,y:number,width:number,height:number,type:string): WallState {
//   return {x,y,width,height,type};
// }

export class MapFactory {
  static getMap() {
  }
}

export const MapCatalog: Map[] = [{
  1: wall(380,260,200,200,'4'),
  2: wall(170,145,140,70,'2'),
  3: wall(205,470,70,140,'1'),
  4: wall(650,505,140,70,'3'),
  5: wall(685,110,70,140,'1'),
}];
