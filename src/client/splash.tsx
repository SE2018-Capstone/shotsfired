import * as React from 'react';
import fetch from 'node-fetch';

interface SplashProps {
  onEnterLobby: () => void;
  onConnectToLobby: (gameCode: string, isPrivateGame: boolean) => void;
}

export class Splash extends React.Component<SplashProps, {}> {

  createPrivateGame() {
    this.createLobby('createPrivate');
  }

  joinRandomGame() {
    this.createLobby('join');
  }

  createLobby(endpoint:string) {
    let currentUrl = window.location.origin;
    fetch(currentUrl+'/'+endpoint).then((response: any) => {
      response.json().then((json: any) => {
        this.props.onConnectToLobby(json['gameCode'], endpoint === 'createPrivate');
      });
    });
    this.props.onEnterLobby();
  }

  render() {
    return (
      <div
        id="splash-screen"
        style={{
          textAlign: 'center',
          color: '#FFFFFF',
          backgroundColor: '#000000',
          width: 640,
          height: 480
        }}>
        <h1> SHOTS FIRED! </h1>
        <button
          onClick={()=>this.joinRandomGame()}
          style={{
            backgroundColor: '#008CBA',
            color: "#FFFFFF",
            fontSize: 28,
            width: 240,
            height: 60
          }}>
          Quick Play
        </button>
        <br/><br/>
        <button
          onClick={()=>this.createPrivateGame()}
          style={{
            backgroundColor: '#008CBA',
            color: "#FFFFFF",
            fontSize: 28,
            width: 240,
            height: 60
          }}>
          Private Match
        </button>
      </div>
    );
  }
}
