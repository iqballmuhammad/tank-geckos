import * as Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');

    this.scene.physics.world.enable(this);
    this.setSize(20, 20);

    this.scene.add.existing(this);
  }
}
