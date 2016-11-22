import * as React from 'react';

interface GameOverProps {
  isWinner: boolean;
  // onPlayAgain: () => void;
  onBackToMainMenu: () => void;
}
interface GameOverState {
  countdownTime: number;
}

const GAMEOVER_COUNTDOWN_TIME = 10;
export class GameOver extends React.Component<GameOverProps, GameOverState> {
  countdownTimer: number;

  constructor(props: GameOverProps) {
    super(props);

    //not really necessary for just going back to main menu, but would be if rematch was an option
    this.state = {countdownTime: GAMEOVER_COUNTDOWN_TIME};
    this.countdownTimer = setTimeout(this.updateCountdown.bind(this), 1000);
  }

  updateCountdown() {
    this.setState({countdownTime: this.state.countdownTime - 1}, () => {
      if (this.state.countdownTime - 1 >= 0) {
        this.countdownTimer = setTimeout(this.updateCountdown.bind(this), 1000);
      } else {
        this.goToMainMenu();
      }
    });
  }

  clearTimer() {
    if (this.countdownTimer !== null) {
      clearTimeout(this.countdownTimer);
    }
    this.countdownTimer = null;
  }

  goToMainMenu() {
    this.clearTimer();
    this.props.onBackToMainMenu();
  }

  render() {
    const gameOverText = this.props.isWinner ? "Congratulations, you won!"
                                             : "Game Over! Better luck next time...";
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
        Returning to main menu in {this.state.countdownTime}
        </div>

        <button
          onClick={() => this.goToMainMenu()}
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