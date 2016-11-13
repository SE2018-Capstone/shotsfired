import * as React from 'react';
import 'p2';
import 'pixi';
import * as Phaser from 'phaser';
import { Bullet } from '../ink-core/bullet'
import { GameState, InputFrame } from '../ink-core/game';

/*
  This class is the "View" class which uses Phaser for input commands and output visuals.
  The game object parameter should not be modified directly at any point in this class
*/
export interface GameCanvasProps {
  game: GameState;
  playerId: string;
  onTick: (input: InputFrame) => void;
}
export class InkGameCanvas extends React.Component<GameCanvasProps, {}> {
  phaserGame: Phaser.Game;
  prevTime: number;
  enemies: Phaser.Sprite[];
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
    // phaserGame.load.image('bullet', '../../res/purple_ball.png');
    phaserGame.load.image('stroke', '../../res/black_circle.png');
  }

  phaserCreate() {

    let {phaserGame} = this;
    phaserGame.stage.backgroundColor = '#124184';
    phaserGame.stage.disableVisibilityChange = true; // TODO: Remove for prod

    // this.bullets = phaserGame.add.group();
    // this.bullets.createMultiple(1000, 'stroke');

    phaserGame.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

    this.prevTime = this.phaserGame.time.now;
  }

  phaserUpdate() {
    const {phaserGame, player, prevTime} = this;
    const {game, playerId} = this.props;

    const delta = phaserGame.time.now - prevTime;
    this.prevTime = phaserGame.time.now;

    const input: InputFrame = {
      down: phaserGame.input.activePointer.isDown,
      mouseX: phaserGame.input.activePointer.x,
      mouseY: phaserGame.input.activePointer.y,
      duration: delta,
      playerId: playerId,
      reset: !!phaserGame.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
    }

    this.props.onTick(input);

    let { bullets, players } = game.entities ;

    if (input.down) {
      console.log("mouse is down at (" + input.mouseX + "," + input.mouseY + ")");
      // let bullet = Bullet.init();
      // bullet.pos = {x: input.mouseX, y: input.mouseY};
      // bullets[bullet.id] = bullet;

    }

    if (input.reset) {
      console.log("resetting canvas");
      // Object.keys(bullets).forEach(id => {
      //   let bullet = bullets[id];
      //   if (bullet.sprite) {
      //     bullet.sprite.destroy();
      //   }
      //   if (bullet.image) {
      //     console.log("destroying...");
      //     bullet.image.destroy();
      //   }
      //   else if (bullet.image !== null) {
      //     console.log("not null destroying...?");
      //     bullet.image.destroy();
      //   }

      // })
      // game.entities.bullets = {};
    }

    Object.keys(bullets).forEach(id => {
      let bullet = bullets[id];
      if (!bullet.hasImage) {
        // let bulletSprite = phaserGame.add.sprite(0, 0, 'stroke');
        let bulletImage = phaserGame.add.image(0, 0, 'stroke');
        bulletImage.x = bullet.pos.x;
        bulletImage.y = bullet.pos.y;
        bullet.image = bulletImage;
        // bulletSprite.x = bullet.pos.x;
        // bulletSprite.y = bullet.pos.y;
        // bullet.sprite = bulletSprite;
        bullet.hasImage = true;
      }
      // let bulletSprite = this.bullets.getFirstDead() as Phaser.Sprite;
      // bulletSprite.reset(bullet.pos.x, bullet.pos.y);
    })

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

  readTextInput(event: Event) {
    console.log("input was: " + event.srcElement.nodeValue);
  }

  render() {
    return (
      <div id="canvasDiv">
      </div>
      );
  }

}