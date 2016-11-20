import * as React from 'react';
import { Game } from '../core/game';


export interface LobbyProps {
  numPlayersInLobby: number;
  maxCountdownTime: number;
}

export interface LobbyState {
  countdownTime: number;
}

export class Lobby extends React.Component<LobbyProps, LobbyState> {
  countdownTimer: number;

  constructor(props: LobbyProps) {
    super(props);
    this.state = { countdownTime: this.props.maxCountdownTime };
  }

  updateCountdown(time: number) {
    this.setState({ countdownTime: time });

    //countdown to 1 to avoid setting state when main state changes from LOADING to RUNNING
    if (time - 1 >= 1) {
      this.countdownTimer = setTimeout(this.updateCountdown.bind(this), 1000, time - 1);
    }
  }

  resetTimer() {
    if (this.countdownTimer != null) {
      clearTimeout(this.countdownTimer);
    }
    this.countdownTimer = null;
  }

  componentWillReceiveProps(nextProps: LobbyProps) {
    if (nextProps.numPlayersInLobby !== this.props.numPlayersInLobby) {
      this.resetTimer();
      if (nextProps.numPlayersInLobby !== Game.settings.maxPlayers) {
        this.updateCountdown(this.props.maxCountdownTime);
      }
    }
  }

  render() {
    let moreThanOnePlayer = (this.props.numPlayersInLobby > 1);
    return (
      <div style={{textAlign: 'center'}} >
        <h2>
          Waiting for more players to join... {(moreThanOnePlayer) ? this.state.countdownTime : ""}
        </h2>
        <br/>
        Currently {this.props.numPlayersInLobby} player{(moreThanOnePlayer) ? "s" : ""} in the lobby
      </div>
    );
  }
}