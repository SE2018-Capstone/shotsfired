import * as React from 'react';

interface GameOverProps {
  isWinner: boolean
  resetToMainMenu: () => void;
}
export class GameOver extends React.Component<GameOverProps, {}> {
  render() {
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
        <h1> GAME OVER! </h1>

        if ({this.props.isWinner}) {
          <h2> Congratulations, you won! </h2>
        }

        <button
          onClick={this.props.resetToMainMenu}
          style={{
            backgroundColor: '#008CBA',
            color: "#FFFFFF",
            fontSize: 28,
            width: 240,
            height: 60
          }}>
          Return to Main Menu
        </button>
      </div>

    );
  }
}