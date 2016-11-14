import { Game, GameState } from './game'


export interface PlayerState {
  id: string;
  score: number;
  isDrawer: boolean;
  guess: string;
}

let lastId = 0;

export class Player {
  static init(overrides: any = {}) {
    return Object.assign({
      id: "" + lastId++,
      score: 0,
      isDrawer: false,
      guess: ""
    }, overrides) as PlayerState;
  }

  static resetGuess(player: PlayerState) {
    player.guess = "";
  }

}