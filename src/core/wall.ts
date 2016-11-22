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
    let events: Event[] = [];
    return events;
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
export const MapCatalog = [{
  walls: [
    {pos: {x: 380, y: 260}, width: 200, height: 200, sprite: WallSprite.BUNKER_2x2_1},
    {pos: {x: 170, y: 145}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_1},
    {pos: {x: 205, y: 470}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
    {pos: {x: 650, y: 505}, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2},
    {pos: {x: 685, y: 110}, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1},
    {pos: {x: 0, y: 720}, width: 960, height: 50, sprite: WallSprite.BUNKER_2x1_2},
    {pos: {x: 0, y: -50}, width: 960, height: 50, sprite: WallSprite.BUNKER_2x1_2},
    {pos: {x: -50, y: 0}, width: 50, height: 720, sprite: WallSprite.BUNKER_2x1_2},
    {pos: {x: 960, y: 0}, width: 50, height: 720, sprite: WallSprite.BUNKER_2x1_2},
  ],
  startPositions: [
    {x: 30, y: 30},
    {x: 930, y: 30},
    {x: 30, y: 690},
    {x: 930, y: 690},
  ]
}];

 