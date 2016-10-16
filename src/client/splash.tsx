import * as React from 'react';
import { Main, ClientState, Stages } from './main';

export class Splash extends React.Component<{}, ClientState> {
    constructor() {
        super();
        this.state = { stage: Stages.SPLASH };
        this.updateState = this.updateState.bind(this);
    }

    updateState() {
        console.log("Quick Play Selected");
        this.setState({stage: Stages.LOADING});
    }

    render() {
        switch(this.state.stage) {
            case Stages.SPLASH:
                return (
                    <div id="splash-screen" style={{
                        textAlign: 'center',
                        color: '#FFFFFF',
                        backgroundColor: '#000000',
                        width: 640,
                        height: 480
                    }}>
                        <h1> SHOTS FIRED! </h1>
                        <button onClick={this.updateState} style={{
                            backgroundColor: '#008CBA',
                            color: "#FFFFFF",
                            fontSize: 28,
                            width: 240,
                            height: 60
                        }}>
                            Quick Play
                        </button>
                    </div>
                );
            case Stages.LOADING:
                return <Main />
        }
    }
}