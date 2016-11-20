import { GameState } from '../core/game';

export const GAME_START_TIME = 5000;
export const SEND_STATE_UPDATE = "state update";
export const SEND_NEW_PLAYER_JOINED = "new player";
export interface StatePayload {
  game: GameState;
  timestamp: number;
};