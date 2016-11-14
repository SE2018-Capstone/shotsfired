import { Game, GameState } from './game'
import { Event, EventFactory } from './event'


export interface PlayerState {
  id: string;
  score: number;
  isDrawer: boolean;
  guess: string;
  isDone: boolean;
}

let lastId = 0;

export class Player {
  static init(overrides: any = {}) {
    return Object.assign({
      id: "" + lastId++,
      score: 0,
      isDrawer: false,
      guess: "",
      isDone: false
    }, overrides) as PlayerState;
  }

  static resetGuess(player: PlayerState, numPlayers: number): Event[] {
    let events: Event[] = [];
    player.guess = "";
    if (player.isDrawer) {
      events.push(EventFactory.createEvent("NEW_DRAWER", player.id, "" + ((parseInt(player.id, 10) + 1) % numPlayers)));
    }
    return events;
  }

  static setDrawer(player: PlayerState, isDrawer: boolean): void {
    player.isDrawer = isDrawer;
  }

  static setGameOver(player: PlayerState) {
    player.isDone = true;
  }

}