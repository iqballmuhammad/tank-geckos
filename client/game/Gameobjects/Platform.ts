import * as Phaser from 'phaser';

export default class Platform extends Phaser.Physics.Arcade.StaticGroup {
  constructor(scene: Phaser.Scene) {
    super(scene.physics.world, scene);

    this.create(0, 360, 'platform');

    this.scene.add.existing(this);
  }
}
