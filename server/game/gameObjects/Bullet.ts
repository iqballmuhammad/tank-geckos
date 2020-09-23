import * as Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    this.scene.events.on('update', this.update, this);
    this.scene.physics.world.enable(this);
    this.setSize(20, 20);

    this.scene.add.existing(this);
  }

  shoot(
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    isFlip: boolean
  ) {
    this.enable();
    this.setPosition(position.x, position.y);
    this.setVelocity(velocity.x, velocity.y);
    this.setFlipX(isFlip);
  }

  enable() {
    this.scene.physics.world.enable(this);
    this.setActive(true);
    this.setVisible(true);
  }

  disable() {
    this.setActive(false);
    this.setVisible(false);
    this.scene.physics.world.disable(this);
  }

  update() {
    if (this.y < this.scene.game.scale.height)
      this.setRotation(
        Math.atan(this.body.velocity.y / this.body.velocity.x) + Math.PI * 2
      );
    else {
      this.setActive(false);
      this.setVisible(false);
      this.scene.physics.world.disable(this);
    }
  }
}
