import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import * as _ from 'lodash';
import { GameState, InputFrame, Game } from '../core/game';
import { WallState } from '../core/maps';

/*
  This class is the "View" class which uses Phaser for input commands and output visuals.
  The game object parameter should not be modified directly at any point in this class
*/

const ACTION_TIMEOUT = 500;

export interface MapperProps {
  game: GameState;
}
export class Mapper extends React.Component<MapperProps, {}> {
  phaserGame: Phaser.Game;
  prevTime: number;
  bunkers: {[id:string]: Phaser.Sprite} = {};
  activeBunker: string = '1';
  commands: string[] = [];
  lastId = -1;
  actionTime: number = Date.now();

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
    phaserGame.load.baseURL = '../../res/';
    // phaserGame.load.image('shooter', 'shooter.png');
    phaserGame.load.image('bullet', 'purple_ball.png');
    phaserGame.load.image('sand', 'sand.png');
    phaserGame.load.image('bunker_1', 'bunker_1x2.png');
    phaserGame.load.image('bunker_2', 'bunker_2x1_destroyed_1.png');
    phaserGame.load.image('bunker_3', 'bunker_2x1_destroyed_2.png');
    phaserGame.load.image('bunker_4', 'bunker_2x2.png');
    // phaserGame.load.atlasJSONHash('ground', 'ground.png', 'ground.json');
  }

  phaserCreate() {

    let {phaserGame} = this;
    let {width, height} = this.props.game.world;

    // phaserGame.camera.width = CAMERA_WIDTH || width;
    // phaserGame.camera.height = CAMERA_HEIGHT || height;
    phaserGame.add.tileSprite(0,0, width, height, 'sand');

    _.forEach(this.props.game.entities.walls, (wall) => {
      const wallSprite = phaserGame.add.sprite(wall.x, wall.y, `bunker_${wall.type}`);
      wallSprite.height = wall.height;
      wallSprite.width = wall.width;
    });

    // let player = phaserGame.add.sprite(0, 0, 'shooter');
    // phaserGame.camera.follow(player);
    // this.player = player;

    this.prevTime = this.phaserGame.time.now;
  }

  bunkerSizes: {[id:string]: {width:number, height:number}} = {
    1: {width: 70, height: 140},
    2: {width: 140, height: 70},
    3: {width: 140, height: 70},
    4: {width: 200, height: 200},
  };
  addBunker(x: number,y: number) {
    if (Date.now() - this.actionTime < ACTION_TIMEOUT) { return; }
    const {width, height} = this.bunkerSizes[this.activeBunker];
    const bunker: WallState = {x,y, width, height, type: this.activeBunker};
    this.lastId++;
    const id = '' + this.lastId;
    this.props.game.entities.walls[id] = bunker;
    this.bunkers[id] = this.phaserGame.add.sprite(bunker.x, bunker.y, `bunker_${bunker.type}`);

    console.log('---');
    console.log(JSON.stringify(this.props.game.entities.walls));
    this.actionTime = Date.now();
  }

  removeLastBunker() {
    if (Date.now() - this.actionTime < ACTION_TIMEOUT || this.lastId < 0) { return; }
    this.bunkers[this.lastId].destroy();
    delete this.props.game.entities.walls[this.lastId];
    this.lastId--;
    this.actionTime = Date.now();
  }

  phaserUpdate() {
    const {phaserGame, prevTime} = this;
    const {game} = this.props;
    const isDown = (key: number) => !!phaserGame.input.keyboard.isDown(key);
    if (isDown(Phaser.Keyboard.ONE)) {
      this.activeBunker = '1';
    } else if (isDown(Phaser.Keyboard.TWO)) {
      this.activeBunker = '2';
    } else if (isDown(Phaser.Keyboard.THREE)) {
      this.activeBunker = '3';
    } else if (isDown(Phaser.Keyboard.FOUR)) {
      this.activeBunker = '4';
    } else if (isDown(Phaser.Keyboard.Z)) {
      this.removeLastBunker();
    }
    if (phaserGame.input.activePointer.isDown) {
      this.addBunker(phaserGame.input.x, phaserGame.input.y);
    }
  }

  phaserRender() {
  }

  componentDidMount() {
    this.phaserInit();
  }

  // Don't bother rerendering since this is all canvas
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div id="canvasDiv"></div>;
  }

}
