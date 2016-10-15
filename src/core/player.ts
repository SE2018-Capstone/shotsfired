import { Entity, EntityState } from './entity';

export interface PlayerState extends EntityState {
  health: number;
}

export class Player {
  static init() {
    return Object.assign(Entity.init(), {
      health: 10,
    }) as PlayerState;
  }
}