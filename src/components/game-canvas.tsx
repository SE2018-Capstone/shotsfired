import * as React from 'react';

export class GameCanvas extends React.Component<{}, {}> {
  canvas: HTMLCanvasElement;     
  ctx: CanvasRenderingContext2D;
  
  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(0, 0, 640, 480);
  }
    
  render() {
    return <canvas
      width={640}
      height={480}
      ref={(c) => this.canvas = c}
    />;
  }
}