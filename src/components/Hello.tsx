import * as React from 'react';
import * as io from 'socket.io-client';

export interface HelloProps { compiler: string; framework: string; }

export class Hello extends React.Component<HelloProps, {}> {
  input: React.Component;
  socket: any;

  constructor(props) {
    super(props);
    var socket = io('localhost:4000');
    socket.on('chat message', function(msg){
      console.log(msg);
    });
    socket.on('connect', function(){});
    socket.on('event', function(data){});
    socket.on('disconnect', function(){});
    this.socket = socket;
  }

  onSubmit(e) {
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
