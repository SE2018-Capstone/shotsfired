
import * as React from 'react';
import { Splash } from './splash';

/*
  This class centers its contents
*/
export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Splash />
      </div>
    );
  }
}
