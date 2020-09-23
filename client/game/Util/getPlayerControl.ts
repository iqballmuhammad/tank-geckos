import * as Phaser from 'phaser';
import { PlayerControl } from '../Interfaces/player';

export const getPlayerControl = (scene: Phaser.Scene): PlayerControl => {
  const { keyboard } = scene.input;

  return {
    forward: keyboard.addKey('D'),
    backward: keyboard.addKey('A'),
    gunUp: keyboard.addKey('W'),
    gunDown: keyboard.addKey('S'),
    fire: keyboard.addKey('SPACE'),
  };
};
