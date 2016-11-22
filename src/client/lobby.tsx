import * as React from 'react';
import { Game } from '../core/game';


interface LobbyProps {
  numPlayersInLobby: number;
  maxCountdownTime: number;
  gameCode: string;
  isPrivateLobby: boolean
}

interface LobbyState {
  countdownTime: number;
}

export class Lobby extends React.Component<LobbyProps, LobbyState> {
  countdownTimer: number;

  constructor(props: LobbyProps) {
    super(props);
    this.state = { countdownTime: this.props.maxCountdownTime / 1000 };
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

  //TODO have the server send time remaining updates to the client
  componentWillReceiveProps(nextProps: LobbyProps) {
    if (nextProps.numPlayersInLobby !== this.props.numPlayersInLobby) {
      this.resetTimer();
      if (nextProps.numPlayersInLobby >= Game.settings.minPlayers &&
        nextProps.numPlayersInLobby < Game.settings.maxPlayers && !nextProps.isPrivateLobby) {

        this.updateCountdown(this.props.maxCountdownTime);
      }
    }
  }

  render() {
    const moreThanOnePlayer = (this.props.numPlayersInLobby > 1);
    const timeDisplay = (moreThanOnePlayer && !this.props.isPrivateLobby) ? this.state.countdownTime : "";
    let urlText:any = "";
    if (this.props.isPrivateLobby) {
      urlText = (<h3> Shareable URL: {window.location.origin}/game/{this.props.gameCode} </h3>);
    }
    return (
      <div style={{textAlign: 'center'}} >
        <h2> Waiting for more players to join... {timeDisplay} </h2>
        <br/>
        Currently {this.props.numPlayersInLobby} player{(moreThanOnePlayer) ? "s" : ""} in the lobby
        <br/>
        {urlText}
      </div>
    );
  }
}