import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import * as _ from 'lodash';
import { GameState, InputFrame, Game } from '../core/game';
import { WallSprite } from '../core/wall';

/*
  This class is the "View" class which uses Phaser for input commands and output visuals.
  The game object parameter should not be modified directly at any point in this class
*/

const CAMERA_WIDTH: number = null;
const CAMERA_HEIGHT: number = null;

export interface GameCanvasProps {
  game: GameState;
  playerId: string;
  onTick: (input: InputFrame) => void;
}
export class GameCanvas extends React.Component<GameCanvasProps, {}> {
  phaserGame: Phaser.Game;
  prevTime: number;
  enemies: Phaser.Sprite[];
  player: Phaser.Sprite;
  bullets: Phaser.Group;

  phaserInit() {
    const {game} = this.props;
    const {width, height} = game.world;
    this.phaserGame = new Phaser.Game(CAMERA_WIDTH || width, CAMERA_HEIGHT || height, Phaser.AUTO, 'canvasDiv', {
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
    phaserGame.load.baseURL = '../../res/';
    phaserGame.load.image('shooter', 'shooter.png');
    phaserGame.load.image('bullet', 'purple_ball.png');
    phaserGame.load.image('sand', 'sand.png');
    phaserGame.load.image(WallSprite[WallSprite.BUNKER_1x2_1], 'bunker_1x2.png');
    phaserGame.load.image(WallSprite[WallSprite.BUNKER_2x1_1], 'bunker_2x1_destroyed_1.png');
    phaserGame.load.image(WallSprite[WallSprite.BUNKER_2x1_2], 'bunker_2x1_destroyed_2.png');
    phaserGame.load.image(WallSprite[WallSprite.BUNKER_2x2_1], 'bunker_2x2.png');
  }

  phaserCreate() {

    let {phaserGame} = this;
    let {width, height} = this.props.game.world;

    phaserGame.add.tileSprite(0,0, width, height, 'sand');

    _.forEach(this.props.game.entities.walls, (wall) => {
      const wallSprite = phaserGame.add.sprite(wall.pos.x, wall.pos.y, WallSprite[wall.sprite]);
      wallSprite.height = wall.height;
      wallSprite.width = wall.width;
    });

    this.enemies = [];
    for (let i = 0; i < Game.settings.maxPlayers; i++) { // move 4 to a constant
      this.enemies[i] = phaserGame.add.sprite(0, 0, 'shooter');
      this.enemies[i].exists = false;
    }

    let player = phaserGame.add.sprite(0, 0, 'shooter');
    phaserGame.camera.follow(player);
    this.player = player;

    this.enemies.concat([player]).forEach(shooter => {
      shooter.scale.setMagnitude(0.3);
      shooter.anchor.setTo(0.5, 0.5);
    });

    this.bullets = phaserGame.add.group();
    this.bullets.createMultiple(50, 'bullet');

    this.prevTime = this.phaserGame.time.now;
  }

  phaserUpdate() {
    const {phaserGame, player, prevTime} = this;
    const {game, playerId} = this.props;

    const delta = phaserGame.time.now - prevTime;
    this.prevTime = phaserGame.time.now;

    const isDown = (key: number) => !!phaserGame.input.keyboard.isDown(key);
    const input: InputFrame = {
      left: isDown(Phaser.Keyboard.A),
      right: isDown(Phaser.Keyboard.D),
      up: isDown(Phaser.Keyboard.W),
      down: isDown(Phaser.Keyboard.S),
      angle: phaserGame.physics.arcade.angleToPointer(player),
      fired: phaserGame.input.activePointer.isDown,
      duration: delta,
      playerId: playerId,
      timestamp: Date.now(),
    };

    // Tell the controller that a frame has occured
    this.props.onTick(input);
    let { players, bullets } = game.entities;

    if (players[playerId]) {
      const playerState = game.entities.players[playerId];
      player.x = playerState.pos.x;
      player.y = playerState.pos.y;
      player.rotation = phaserGame.physics.arcade.angleToPointer(player);
    } else {
      player.alive = false;
      player.exists = false;
    }


    // TODO: Make this cleaner
    let i = 0;
    Object.keys(players).filter(id => id !== playerId).forEach(id => {
      let player = players[id];
      let enemy = this.enemies[i++];
      enemy.exists = true;
      enemy.x = player.pos.x;
      enemy.y = player.pos.y;
      enemy.rotation = player.orientation;
    });
    for (;i < this.enemies.length; i++) {
      this.enemies[i].exists = false;
    }

    this.bullets.setAll('alive', false);
    this.bullets.setAll('exists', false);
    Object.keys(bullets).forEach(id => {
      let bullet = bullets[id];
      let bulletSprite = this.bullets.getFirstDead() as Phaser.Sprite;
      bulletSprite.reset(bullet.pos.x, bullet.pos.y);
    });
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
