import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import { Game, GameState, InputState } from '../core/game';

export interface GameCanvasProps {gameState: GameState;}

export class GameCanvas extends React.Component<GameCanvasProps, {}> {
  game: Phaser.Game;
  prevTime: number;
  players: Phaser.Sprite;
  // bullets: Phaser.Group;
  
  phaserInit() {
    const {gameState} = this.props;
    const {width, height} = gameState.world;
    Game.update(gameState, null);
    this.game = new Phaser.Game(width, height, Phaser.AUTO, 'canvasDiv', {
      preload: this.phaserPreload.bind(this),
      create: this.phaserCreate.bind(this),
      update: this.phaserUpdate.bind(this),
      render: this.phaserRender.bind(this),
    });
  }
  
  phaserPreload() {
    const {game} = this;
    const {width, height} = this.props.gameState.world;
    game.world.setBounds(0, 0, width, height);
    game.load.image('shooter', '../../res/shooter.png');
    // game.load.image('bullet', '../../res/purple_ball.png');
  }
  
  phaserCreate() {
    this.prevTime = this.game.time.now;
    
    let {game} = this;
    game.stage.backgroundColor = '#124184';
    let shooter = game.add.sprite(320, 240, 'shooter');
    shooter.scale.setMagnitude(0.3);
    shooter.anchor.setTo(0.5, 0.5);
    game.camera.follow(shooter);
  }
  
  phaserUpdate() {
    const {game, prevTime} = this;
    
    const delta = game.time.now - prevTime;
    const isDown = (key: number) => !!game.input.keyboard.isDown(key);
    const input = {
      left: isDown(Phaser.Keyboard.LEFT),
      right: isDown(Phaser.Keyboard.RIGHT),
      up: isDown(Phaser.Keyboard.UP),
      down: isDown(Phaser.Keyboard.DOWN),
      angle: 0, // game.physics.arcade.angleToPointer(player)
      fired: game.input.activePointer.isDown,
      duration: delta,
    };
    Game.update(this.props.gameState, input);
    
    this.prevTime = game.time.now;
  }
  
  phaserRender() {
  }
    
  componentDidMount() {
    this.phaserInit();
  }
  
  // Don't bother rerendering since this is all canvas
  shouldComponentUpdate(nextProps: GameCanvasProps) {
    return false;
  }
  
  render() {
    return <div id="canvasDiv"></div>;
  }
  
}