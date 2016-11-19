import * as React from 'react';

interface GameOverProps {
  isWinner: boolean;
  countdownTime: number;
  onPlayAgain: () => void;
  onBackToMainMenu: () => void;
}
export class GameOver extends React.Component<GameOverProps, {}> {
  render() {
    let gameOverText = "";
    if (this.props.isWinner) {
      gameOverText = "Congratulations, you won!"
    }
    else {
      gameOverText = "Game Over! Better luck next time..."
    }
    return (
      <div
        id="game-over-screen"
        style={{
          textAlign: 'center',
          color: '#FFFFFF',
          backgroundColor: '#000000',
          width: 640,
          height: 480
        }}>
        <h2> {gameOverText} </h2>
        
        <div style={{paddingTop: 10, paddingBottom: 5}} >
        Waiting for all players to confirm rematch... {this.props.countdownTime}
        </div>

        <button
          onClick={this.props.onPlayAgain}
          style={{
            backgroundColor: '#008CBA',
            color: "#FFFFFF",
            fontSize: 28,
            width: 240,
            height: 60
          }}>
          Rematch!
        </button>
        &nbsp;
        <button
          onClick={this.props.onBackToMainMenu}
          style={{
            backgroundColor: '#008CBA',
            color: "#FFFFFF",
            fontSize: 28,
            width: 240,
            height: 60
          }}>
          Main Menu
        </button>

      </div>
    );
  }
}