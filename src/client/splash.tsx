import * as React from 'react';

interface SplashProps {
  onQuickPlay: () => void;
}
export class Splash extends React.Component<SplashProps, {}> {
  render() {
    const textColour = '#FFFFFF';
    const buttonColour = '#008CBA';
    return (
      <div
        id="splash-screen"
        style={{
          fontSize: 20,
          textAlign: 'center',
          color: textColour,
          backgroundColor: '#000000',
          width: 640,
          height: 480,
          paddingTop: 20
        }}>
        <div id="title-left" style={{float: 'left'}}>
          <img src="../../res/shot.png" style={{width: '30%', height: '30%'}}/>
        </div>
        <div id="title-right" style={{float: 'right'}}>
          <img src="../../res/shot.png" style={{width: '30%', height: '30%'}}/>
        </div>
        <div id="title-center" style={{fontSize: 40, fontWeight: 'bold', paddingBottom: 5}} >
          SHOTS FIRED!
        </div>
        <hr style={{color: textColour}} />
        
        <div id="left" style={{width: '50%', float: 'left', paddingTop: 35}}>
          <div id="mode-text" style={{paddingLeft: 20, paddingRight: 20}}>
            Play against random people
            <br/>
            in this 2-4 person mode
          </div>
          <br/>
          <img src="../../res/2-player-icon.png" style={{width: 75, height: 60}} />
          <br/> TO <br/>
          <img
            src="../../res/2-player-icon.png"
            style={{
              width: 75,
              height: 60,
              paddingTop: 5,
              marginRight: -11
            }}
          />
          <img
            src="../../res/2-player-icon.png"
            style={{
              width: 75,
              height: 60,
              paddingTop: 5
            }}
          />

        </div>

        <div id="right" style={{width: '50%', float: 'right', paddingTop: 35}}>
          <div id="mode-text" style={{paddingLeft: 20, paddingRight: 20}}>
            Play with friends by
            <br/>
            getting a shareable URL
            <br/>
            to join the same party
          </div>
          <br/>
          <img src='../../res/2-player-icon.png' style={{width: 125, height: 100, marginRight: -18}} />
          <img src='../../res/2-player-icon.png' style={{width: 125, height: 100}} />
          <h3 style={{marginTop: -10}} > WWW. </h3>
        </div>
        <br style={{clear: 'both'}} />
        <div id="button-container" style={{textAlign: 'center', marginTop: 10}}>
          <div id="left-button" style={{float: 'left', width: '50%'}}>
            <button
              onClick={this.props.onQuickPlay}
              style={{
                backgroundColor: buttonColour,
                color: textColour,
                fontSize: 28,
                width: 240,
                height: 60
              }}>
              Quick Play
            </button>
          </div>
          <div id="right-button" style={{float: 'right', width: '50%'}}>
            <button
              onClick={this.props.onQuickPlay}
              style={{
                backgroundColor: buttonColour,
                color: textColour,
                fontSize: 28,
                width: 240,
                height: 60
              }}>
              Private Match
            </button>
          </div>
          <br style={{clear: 'both'}} />
        </div>
      </div>
    );
  }
}