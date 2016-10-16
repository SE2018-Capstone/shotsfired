export interface PlayerState {
  x: number;
  y: number;
  health: number;
  orientation: number;
}

export interface FrameEvent {
  moveUp: boolean; // Whether we should be moving up
  moveLeft: boolean; // Whether we should be moving left
  moveRight: boolean; // Whether we should be moving left
  moveDown: boolean; // Whether we should be moving left
  shoot: boolean; // Whether we should try to shoot
  orientation: number; // 0-359.99999... Angle of character, with 0 being straight up and 90 being to the left
  clientTimestamp: number; // When the local frame finished
  serverTimestamp: number; // When the server recieves and processes the frame
  frameDuration: number; // Time frame took (in ms) from previous clientTimestamp to this clientTimestamp
}

// Interface for entire game state
export interface GameState {
  numPlayers: number; // Number of players in game
  playerStates: PlayerState[]; // numPlayers players in this array - 1 per player
  lastVerifiedFrames: number[]; // numPlayers last verified FrameEvents - last server verified frame local timestamp for each player
}

export class Game {
  state: GameState;

  constructor() {
    this.state = {numPlayers:2, playerStates: [{x:1, y:1, health:1, orientation:180},{x:1, y:1, health:1, orientation:180},{x:1, y:1, health:1, orientation:180},{x:1, y:1, health:1, orientation:180},], lastVerifiedFrames: [1,2,3,4]};
    // GARBAGE VALUES TO TEST THROUGHPUT

  }

  update(delta: number) {
    console.log(delta);   
  }

  applyFrame(frame:FrameEvent) {
    console.log(frame);
  }

  applyState(state: GameState) {
    console.log(state);
  }
}
