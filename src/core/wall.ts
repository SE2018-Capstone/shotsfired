import { Entity, EntityState } from './entity';
import { GameState } from './game';
import { Event } from './event'

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
  
  static update(wall: WallState, delta: number, game: GameState){
    // return super.update(wall, delta, game); 
    let events: Event[] = [];
    return events;
  }
  
  static collision(other: EntityState, wall: WallState) {
    if (other.pos.x > wall.pos.x && other.pos.x < wall.pos.x + wall.width && 
        other.pos.y > wall.pos.y && other.pos.y < wall.pos.y + wall.height ) {
         return true; 
    }
    if (other.pos.x > wall.pos.x && other.pos.x < wall.pos.x && 
      (other.pos.y + other.radius > wall.pos.y && other.pos.y + other.radius < wall.pos.y + wall.height ||
      other.pos.y - other.radius > wall.pos.y && other.pos.y - other.radius < wall.pos.y + wall.height)) {
        return true; 
    }
    if (other.pos.y > wall.pos.y && other.pos.y < wall.pos.y && 
      (other.pos.x + other.radius > wall.pos.x && other.pos.x + other.radius < wall.pos.x + wall.width ||
      other.pos.x - other.radius > wall.pos.x && other.pos.x - other.radius < wall.pos.x + wall.width)) {
        return true; 
    }
    return false;
  }
  
  static collideWith(wall: WallState, other: EntityState, game: GameState) {
    return;
  }

}

// State for the backup data for a wall
export interface StoredWallState  {
  pos: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  sprite: WallSprite;
}

// List of maps, stores the minimal amount of data needed so that
// this could be moved into a JSON file to backup maps
export const MapCatalog: StoredWallState[][] = [[
  {pos: {x: 380, y: 260}, width: 200, height: 200, sprite: WallSprite.BUNKER_2x2_1},
  {pos: {x: 170, y: 145}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_1},
  {pos: {x: 205, y: 470}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 650, y: 505}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 685, y: 110}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 0, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 140, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 280, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 420, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 560, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 700, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 840, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 980, y: 650}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 0, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 140, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 280, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 420, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 560, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 700, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 840, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 980, y: 0}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
  {pos: {x: 0, y: 0}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 0, y: 140}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 0, y: 280}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 0, y: 420}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 0, y: 560}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 0, y: 700}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 910, y: 0}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 910, y: 140}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 910, y: 280}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 910, y: 420}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 910, y: 560}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
  {pos: {x: 910, y: 700}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
]];
