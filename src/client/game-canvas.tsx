import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import { Game, GameState, InputState } from '../core/game';

export interface GameCanvasProps {game: GameState;}

export class GameCanvas extends React.Component<GameCanvasProps, {}> {
  phaserGame: Phaser.Game;
  prevTime: number;
  enemies: Phaser.Group;
  player: Phaser.Sprite;
  // bullets: Phaser.Group;

  phaserInit() {
    const {game} = this.props;
    const {width, height} = game.world;
    this.phaserGame = new Phaser.Game(width, height, Phaser.AUTO, 'canvasDiv', {
      preload: this.phaserPreload.bind(this),
      create: this.phaserCreate.bind(this),
      update: this.phaserUpdate.bind(this),
      render: this.phaserRender.bind(this),
    });
  }

  phaserPreload() {
    const {phaserGame} = this;
    const {width, height} = this.props.game.world;
    phaserGame.world.setBounds(0, 0, width, height);
    phaserGame.load.image('shooter', '../../res/shooter.png');
    // game.load.image('bullet', '../../res/purple_ball.png');
  }

  phaserCreate() {

    let {phaserGame} = this;
    phaserGame.stage.backgroundColor = '#124184';

    let enemies = phaserGame.add.group();
    enemies = phaserGame.add.group();
    enemies.createMultiple(4, 'shooter');
    // enemies.setAll('scale.magnitude', 0.3);
    // enemies.setAll('anchor', new Phaser.Point(0.5, 0.5));
    this.enemies = enemies;

    let player = phaserGame.add.sprite(0, 0, 'shooter');
    player.scale.setMagnitude(0.3);
    player.anchor.setTo(0.5, 0.5);
    phaserGame.camera.follow(player);
    this.player = player;

    this.prevTime = this.phaserGame.time.now;
  }

  phaserUpdate() {
    const {phaserGame, player, prevTime} = this;
    const game = this.props.game;

    const delta = phaserGame.time.now - prevTime;
    this.prevTime = phaserGame.time.now;

    const isDown = (key: number) => !!phaserGame.input.keyboard.isDown(key);
    const input = {
      left: isDown(Phaser.Keyboard.LEFT),
      right: isDown(Phaser.Keyboard.RIGHT),
      up: isDown(Phaser.Keyboard.UP),
      down: isDown(Phaser.Keyboard.DOWN),
      angle: phaserGame.physics.arcade.angleToPointer(player),
      fired: phaserGame.input.activePointer.isDown,
      duration: delta,
    };
    Game.update(this.props.game, input);

    const playerState = game.entities.players[game.activePlayer];
    player.x = playerState.pos.x;
    player.y = playerState.pos.y;
    player.rotation = phaserGame.physics.arcade.angleToPointer(player);
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