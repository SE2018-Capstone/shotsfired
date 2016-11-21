import * as React from 'react';

interface GameOverProps {
  isWinner: boolean;
  maxCountdownTime: number;
  // onPlayAgain: () => void;
  onBackToMainMenu: () => void;
}
interface GameOverState {
  countdownTime: number;
}

export class GameOver extends React.Component<GameOverProps, GameOverState> {
  countdownTimer: number;

  constructor(props: GameOverProps) {
    super(props);

    //not really necessary for just going back to main menu, but would be if rematch was an option
    this.state = {countdownTime: this.props.maxCountdownTime};
    this.countdownTimer = setTimeout(this.updateCountdown.bind(this), 1000, this.state.countdownTime - 1);
  }

  updateCountdown(time: number) {
    this.setState({countdownTime: time});
    if (time - 1 >= 0) {
      this.countdownTimer = setTimeout(this.updateCountdown.bind(this), 1000, time - 1);
    }
    else {
      this.goToMainMenu();
    }
  }

  resetTimer() {
    if (this.countdownTimer != null) {
      clearTimeout(this.countdownTimer);
    }
    this.countdownTimer = null;
  }

  goToMainMenu() {
    this.resetTimer();
    this.props.onBackToMainMenu();
  }

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
        Going back to main menu in... {this.state.countdownTime}
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