import { Entity, EntityState } from './entity';

export enum WallSprite {
  BUNKER_1x2_1,
  BUNKER_2x1_1,
  BUNKER_2x1_2,
  BUNKER_2x2_1,
};

export interface WallState extends EntityState {
  width: number;
  height: number;
  sprite: WallSprite;
}

export class Wall extends Entity {
  static init(overrides: any = {}) {
    return Object.assign(super.init(), {
      width: 200,
      height: 200,
      sprite: 'bunker_2x2_1',
      type: 'wall',
    }, overrides) as WallState;
  }
}

export class WallFactory {
  static create(x:number,y:number,width:number,height:number,sprite:WallSprite) {
    return Wall.init({pos: {x,y},width,height,sprite});
  }
}

// List of maps, where a map is a list of parameters to WallFactory.create
export const MapCatalog: [number, number, number, number, WallSprite][][] = [[
  [380,260,200,200, WallSprite.BUNKER_2x2_1],
  [170,145,140,70, WallSprite.BUNKER_2x1_1],
  [205,470,70,140, WallSprite.BUNKER_1x2_1],
  [650,505,140,70, WallSprite.BUNKER_2x1_2],
  [685,110,70,140, WallSprite.BUNKER_1x2_1],
]];
