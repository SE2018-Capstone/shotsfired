import * as React from 'react';
import { GameCanvas } from './game-canvas'

export class Main extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <GameCanvas/>
      </div>
    );
  }
}