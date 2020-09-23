import * as Phaser from 'phaser';
import { Game } from 'phaser';
import PreloadScene from './Scene/PreloadScene';
import SampleScene from './Scene/SampleScene';

const config: Phaser.Types.Core.GameConfig = {
  title: 'Sample Game',
  type: Phaser.AUTO,
  scale: {
    parent: 'game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 768,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: process.env.NODE_ENV === 'development',
    },
  },
  backgroundColor: '#f2f2f2',
  scene: [PreloadScene, SampleScene],
};

// @ts-ignore
window.addEventListener('load', () => {
  const game = new Game(config);
});
