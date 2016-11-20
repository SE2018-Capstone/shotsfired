import * as React from 'react';

interface SplashProps {
  onQuickPlay: () => void;
  onPrivateMatch: () => void;
}

export class Splash extends React.Component<SplashProps, {}> {
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
          onClick={this.props.onQuickPlay}
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
          onClick={this.props.onPrivateMatch}
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
