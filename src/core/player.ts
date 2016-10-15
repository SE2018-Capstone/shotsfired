import { Entity, EntityState } from './entity';

export interface PlayerState extends EntityState {
  health: number;
}

export module Player {
  export function init() {
    return Object.assign(Entity.init(), {
      health: 10,
    }) as PlayerState;
  }
}