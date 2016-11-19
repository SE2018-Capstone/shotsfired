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
        <h1> {gameOverText} </h1>
        
        <div style={{paddingTop: 40, paddingBottom: 20}} >
        Waiting for all players to confirm rematch... {this.props.countdownTime}
        </div>

        <button
          onClick={this.props.onPlayAgain}
          style={{
            backgroundColor: '#008CBA',
            color: "#FFFFFF",
            fontSize: 28,
            width: 240,
            height: 60,
            marginRight: 20
          }}>
          Rematch!
        </button>
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