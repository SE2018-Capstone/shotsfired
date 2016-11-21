import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import * as _ from 'lodash';
import { GameState, Game } from '../core/game';
import { WallSprite, WallState, WallFactory } from '../core/wall';

// The time allowed between each action (like adding an element and removing one)
// This stops issues like one click doesn't create multiple entities
const ACTION_TIMEOUT = 500;

export interface MapperProps {
  game: GameState;
}
export class Mapper extends React.Component<MapperProps, {}> {
  phaserGame: Phaser.Game;
  prevTime: number;
  bunkers: {[id:string]: Phaser.Sprite} = {};
  activeBunkerType: WallSprite = WallSprite.BUNKER_1x2_1;
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

    this.prevTime = this.phaserGame.time.now;
  }

  bunkerSizes: {[id:number]: {width:number, height:number}} = {
    [WallSprite.BUNKER_1x2_1]: {width: 70, height: 140},
    [WallSprite.BUNKER_2x1_1]: {width: 140, height: 70},
    [WallSprite.BUNKER_2x1_2]: {width: 140, height: 70},
    [WallSprite.BUNKER_2x2_1]: {width: 200, height: 200},
  };
  addBunker(x: number,y: number) {
    if (Date.now() - this.actionTime < ACTION_TIMEOUT) { return; }
    const {width, height} = this.bunkerSizes[this.activeBunkerType];
    const bunker: WallState = WallFactory.create(x,y,width,height,this.activeBunkerType);
    this.props.game.entities.walls[bunker.id] = bunker;
    this.bunkers[bunker.id] = this.phaserGame.add.sprite(bunker.pos.x, bunker.pos.y, WallSprite[bunker.sprite]);

    console.log('---');
    console.log(JSON.stringify(this.props.game.entities.walls));
    this.actionTime = Date.now();
  }

  removeLastBunker() {
    if (Date.now() - this.actionTime < ACTION_TIMEOUT) { return; }
    const lastId = _.max(Object.keys(this.bunkers));
    this.bunkers[lastId].destroy();
    delete this.props.game.entities.walls[lastId];
    this.actionTime = Date.now();
  }

  phaserUpdate() {
    const {phaserGame, prevTime} = this;
    const isDown = (key: number) => !!phaserGame.input.keyboard.isDown(key);

    new Map<number, WallSprite>([
      [Phaser.Keyboard.ONE, WallSprite.BUNKER_1x2_1],
      [Phaser.Keyboard.TWO, WallSprite.BUNKER_2x1_1],
      [Phaser.Keyboard.THREE, WallSprite.BUNKER_2x1_2],
      [Phaser.Keyboard.FOUR, WallSprite.BUNKER_2x2_1],
    ]).forEach((type, key) => {
      if (isDown(key)) { this.activeBunkerType = type; }
    });

    if (isDown(Phaser.Keyboard.Z)) {
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
