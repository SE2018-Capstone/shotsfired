import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';

export interface GameCanvasProps { width: number; height: number; }

export class GameCanvas extends React.Component<GameCanvasProps, {}> {
  canvas: HTMLCanvasElement;     
  ctx: CanvasRenderingContext2D;
  game: Phaser.Game;
  line: Phaser.Line;
  
  
  phaserInit() {
    const {width, height} = this.props;
    this.game = new Phaser.Game(width, height, Phaser.AUTO, 'canvasDiv', {
      create: this.phaserCreate.bind(this),
      update: this.phaserUpdate.bind(this),
      render: this.phaserRender.bind(this),
    });
  }
  
  phaserCreate() {
    this.game.stage.backgroundColor = '#124184';
    this.line = new Phaser.Line(100, 100, 200, 200);
  }
  
  phaserUpdate() {
    const {line, game} = this;
    line.centerOn(game.input.activePointer.x, game.input.activePointer.y);
    line.rotate(0.05);
  }
  
  phaserRender() {
    const {line, game} = this;
    game.debug.geom(line);
    game.debug.lineInfo(line, 32, 32)
  }
    
  componentDidMount() {
    this.phaserInit();
  }
  
  render() {
    return <div id="canvasDiv"></div>;
  }
  
}