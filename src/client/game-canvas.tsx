import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import { GameState } from '../core/game';

export interface GameCanvasProps { width: number; height: number; gameState: GameState; }


export class GameCanvas extends React.Component<GameCanvasProps, {}> {
  canvas: HTMLCanvasElement;     
  ctx: CanvasRenderingContext2D;
  game: Phaser.Game;
  prevTime: number;
  shooter: Phaser.Sprite;
  bullets: Phaser.Group;
  FIRE_RATE = 100;
  nextFire = 0;
  
  phaserInit() {
    const {width, height} = this.props;
    this.game = new Phaser.Game(width, height, Phaser.AUTO, 'canvasDiv', {
      preload: this.phaserPreload.bind(this),
      create: this.phaserCreate.bind(this),
      update: this.phaserUpdate.bind(this),
      render: this.phaserRender.bind(this),
    });
  }
  
  phaserPreload() {
    const {game} = this;
    const {width, height} = this.props;
    game.world.setBounds(0, 0, width, height);
    game.load.image('shooter', '../../res/shooter.png');
    game.load.image('bullet', '../../res/purple_ball.png');
  }
  
  phaserCreate() {
    this.prevTime = this.game.time.now;
    
    let {game} = this;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#124184';
    this.shooter = game.add.sprite(320, 240, 'shooter');
    game.physics.enable(this.shooter, Phaser.Physics.ARCADE);
    this.shooter.scale.setMagnitude(0.3);
    this.shooter.anchor.setTo(0.5, 0.5);
    game.camera.follow(this.shooter);
    
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  }
  
  phaserUpdate() {
    const {game, prevTime, shooter} = this;
    
    const delta = game.time.now - prevTime;
    
    let vel = 300;
    shooter.body.velocity.x = 0;
    shooter.body.velocity.y = 0;
    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      shooter.body.velocity.x -= vel;
    } 
    if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      shooter.body.velocity.x += vel;
    } 
    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      shooter.body.velocity.y -= vel;
    } 
    if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      shooter.body.velocity.y += vel;
    }
    shooter.rotation = game.physics.arcade.angleToPointer(shooter);
    
    if (game.input.activePointer.isDown && game.time.now > this.nextFire && this.bullets.countDead() > 0) {
      this.nextFire = game.time.now + this.FIRE_RATE;
      let bullet = this.bullets.getFirstDead() as Phaser.Sprite;
      bullet.reset(shooter.x - 8, shooter.y - 8);
      game.physics.arcade.moveToPointer(bullet, 300);
    }
    
    this.prevTime = game.time.now;
  }
  
  phaserRender() {
  }
    
  componentDidMount() {
    this.phaserInit();
  }
  
  shouldComponentUpdate(nextProps: GameCanvasProps) {
    let shouldUpdate = false;
    Object.keys(this.props).forEach((key) => {
      if (key !== 'game' && (this.props as any)[key] !== (nextProps as any)[key]) {
        return shouldUpdate;
      }
    });
    return shouldUpdate;
  }
  
  render() {
    return <div id="canvasDiv"></div>;
  }
  
}