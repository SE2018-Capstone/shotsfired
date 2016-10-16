import { Game, GameState, InputState } from './game';

export class Clock {
    static tick(state: GameState, input:InputState) {
      Game.update(state, input);
    }
};