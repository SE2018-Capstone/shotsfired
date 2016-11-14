import { GameState } from '../core/game';

export const SEND_STATE_UPDATE = "state update";
export interface StatePayload {
  game: GameState;
  timestamp: number;
};