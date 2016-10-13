import * as React from 'react';
import * as io from 'socket.io-client';

export interface HelloProps { compiler: string; framework: string; }

export class Hello extends React.Component<HelloProps, {}> {
  input: HTMLInputElement;
  socket: any;

  constructor(props: HelloProps) {
    super(props);
    this.socket = io('localhost:3000');
    this.socket.on('chat message', function(msg: String){
      console.log(msg);
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.socket.emit('chat message', this.input.value);
    this.input.value = '';
  }

  render() {
    return <h1>
      <div>
        Hello from {this.props.compiler} and {this.props.framework}!
      </div>
      <form onSubmit={this.onSubmit.bind(this)}>
        <input ref={(i) => this.input = i}/>
      </form>
    </h1>;
  }
}
