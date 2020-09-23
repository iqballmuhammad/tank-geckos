import '@geckos.io/phaser-on-nodejs';
import * as Phaser from 'phaser';
import GameScene from './scene/gameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: 1280,
  height: 768,
  banner: false,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
    },
  },
};

export default config;
