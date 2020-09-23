import { ServerChannel } from '@geckos.io/server';
import * as Phaser from 'phaser';
import Bullet from './Bullet';

enum MoveState {
  FORWARD = 1,
  IDLE = 0,
  BACKWARD = -1,
}

export default class Tank extends Phaser.GameObjects.Container {
  channel: ServerChannel;

  moveState: MoveState = MoveState.IDLE;

  turretState: MoveState = MoveState.IDLE;

  health = 100;

  isDeath = false;

  public tankBody: Phaser.GameObjects.Sprite;

  private tankTurret: Phaser.GameObjects.Sprite;

  private arcadeBody: Phaser.Physics.Arcade.Body;

  private bulletPool: Phaser.GameObjects.Group;

  private playerList: Record<string, Tank> = {};

  private speed = {
    move: 20,
    rotation: 1,
    bullet: 300,
  };

  private threshold = {
    rotation: {
      max: -60,
      min: 0,
    },
  };

  private size = {
    x: 277,
    y: 176,
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    channel: ServerChannel
  ) {
    super(scene, x, y);

    this.channel = channel;

    this.tankBody = this.scene.add.sprite(0, 0, '');
    this.tankTurret = this.scene.add.sprite(20, -60, '');

    this.tankTurret.setOrigin(0, 0.5);

    this.setSize(this.size.x, this.size.y);
    this.setScale(0.25, 0.25);

    this.scene.physics.world.enable(this);

    this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;
    this.arcadeBody.setCollideWorldBounds(true);

    this.add([this.tankBody, this.tankTurret]);

    this.scene.events.on('update', this.update, this);

    this.bulletPool = this.scene.add.group({
      classType: Bullet,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.scene.add.existing(this);
  }

  getBulletPool() {
    return (this.bulletPool.getChildren() as Bullet[]).map(
      ({ x, y, angle, active, flipX }) => {
        return {
          x,
          y,
          angle,
          active,
          flipX,
        };
      }
    );
  }

  fireBullet() {
    const bullet = this.bulletPool.get() as Bullet;
    const dir = this.scaleX > 0 ? 1 : -1;
    const velocity = this.scene.physics.velocityFromAngle(
      this.tankTurret.angle - 5,
      1000
    );
    const vx = velocity.x * dir;

    if (bullet)
      bullet.shoot(
        {
          x: this.x + this.tankTurret.width * dir,
          y: this.y + this.tankTurret.y / 4 + this.tankTurret.angle * 0.7,
        },
        { ...velocity, x: vx },
        vx < 0
      );
  }

  getTurretAngle(): number {
    return this.tankTurret.angle;
  }

  moveTank(delta: number) {
    this.arcadeBody.setVelocityX(this.speed.move * this.moveState * delta);
  }

  rotateTurret(delta: number) {
    const { angle } = this.tankTurret;
    const { min, max } = this.threshold.rotation;
    if (this.turretState === MoveState.BACKWARD && angle < min)
      return this.tankTurret.setAngle(angle + this.speed.rotation);

    if (this.turretState === MoveState.FORWARD && angle > max)
      return this.tankTurret.setAngle(angle - this.speed.rotation);
  }

  flipScale() {
    if (this.moveState === MoveState.BACKWARD) {
      this.setScale(-Math.abs(this.scaleX), this.scaleY);
      this.setSize(-Math.abs(this.size.x), this.size.y);
      return;
    }

    if (this.moveState === MoveState.FORWARD) {
      this.setScale(Math.abs(this.scaleX), this.scaleY);
      this.setSize(Math.abs(this.size.x), this.size.y);
      return;
    }
  }

  setAliveStatus(isAlive: boolean) {
    this.isDeath = !isAlive;
    this.setActive(isAlive);
    this.setVisible(isAlive);
    this.health = isAlive ? 100 : 0;

    if (isAlive) this.scene.physics.world.enable(this);
    else this.scene.physics.world.disable(this);
  }

  handleAttacked(damage: number) {
    this.health = this.health <= damage ? 0 : this.health - damage;

    if (this.health <= 0) {
      this.setAliveStatus(false);
      console.log(`${this.channel.id} dead`);
    }
  }

  onBulletCollide(
    go: Phaser.GameObjects.GameObject,
    go2: Phaser.GameObjects.GameObject
  ) {
    const bullet = go as Bullet;
    const tank = go2 as Tank;

    bullet.disable();
    tank.handleAttacked(bullet.damage);
  }

  updateBulletCollider(list: Record<string, Tank>) {
    this.playerList = list;

    Object.keys(this.playerList).forEach((playerId) => {
      if (this.playerList[playerId] && playerId !== this.channel.id)
        this.scene.physics.add.collider(
          this.bulletPool,
          this.playerList[playerId],
          this.onBulletCollide,
          undefined,
          this
        );
    });
  }

  update(time: number, delta: number) {
    this.moveTank(delta);
    this.rotateTurret(delta);
    this.flipScale();
  }
}
