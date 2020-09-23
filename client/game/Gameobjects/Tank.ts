import * as Phaser from 'phaser';
import { getPlayerControl } from '../Util/getPlayerControl';
import { PlayerControl } from '../Interfaces/player';
import { TANK_EVENTS } from '../Interfaces/events/tank';
import Bullet from './Bullet';
import { BattleGroundBullet } from '../Interfaces/rooms/battleground';

enum MoveState {
  FOWARD = 1,
  IDLE = 0,
  BACKWARD = -1,
}

export default class Tank extends Phaser.GameObjects.Container {
  health: number;
  isDeath = false;
  moveState: MoveState = MoveState.IDLE;
  turretState: MoveState = MoveState.IDLE;
  private size = {
    x: 277,
    y: 176,
  };
  private tankBody: Phaser.GameObjects.Image;
  private tankTurret: Phaser.GameObjects.Image;
  private control: PlayerControl;
  private isPlayer = false;
  private isFired = false;
  private bulletPool: Phaser.GameObjects.Group;
  private gameoverText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, isPlayer: boolean, health: number) {
    super(scene);

    this.health = health;

    this.isPlayer = isPlayer;

    this.tankBody = this.scene.add.sprite(0, 0, 'tank');
    this.tankTurret = this.scene.add.sprite(20, -60, 'gun');
    const text = this.scene.add.text(0, 0, 'AA');

    this.tankTurret.setOrigin(0, 0.5);

    this.setSize(this.size.x, this.size.y);
    this.setScale(0.25, 0.25);

    this.add([this.tankBody, this.tankTurret, text]);

    this.scene.events.on('update', this.update, this);

    this.scene.physics.world.enable(this);

    this.bulletPool = this.scene.add.group({
      classType: Bullet,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.control = getPlayerControl(this.scene);

    this.scene.add.existing(this);
  }

  update() {
    if (!this.isDeath) {
      this.handleControl();
      this.handleFlipCollider();
      this.handleFireControl();
    }
  }

  setGameoverText(go: Phaser.GameObjects.Text) {
    this.gameoverText = go;
  }

  setAliveStatus(isAlive: boolean) {
    if (this.isDeath !== isAlive) return;
    this.isDeath = !isAlive;
    this.setActive(isAlive);
    this.setVisible(isAlive);
    if (this.isPlayer) this.gameoverText?.setVisible(!isAlive);
  }

  setTurretAngle(degrees: number) {
    this.tankTurret.setAngle(degrees);
  }

  updateBulletPool(bullets: BattleGroundBullet[]) {
    bullets.forEach((item, i) => {
      if (!this.bulletPool.getChildren()[i]) this.bulletPool.create();
      const bullet = this.bulletPool.getChildren()[i] as Bullet;

      bullet.setPosition(item.x, item.y);
      bullet.setAngle(item.angle);
      bullet.setActive(item.active);
      bullet.setVisible(item.active);
      bullet.setFlipX(item.isFlip);
    });
  }

  handleControl() {
    if (this.isPlayer) {
      this.handleMoveState();
      this.handleTurretState();
    }
  }

  handleMoveState() {
    if (this.control.forward.isDown) {
      this.moveState = MoveState.FOWARD;
      return;
    }

    if (this.control.backward.isDown) {
      this.moveState = MoveState.BACKWARD;
      return;
    }

    this.moveState = MoveState.IDLE;
  }

  handleTurretState() {
    if (this.control.gunUp.isDown) {
      this.turretState = MoveState.FOWARD;
      return;
    }

    if (this.control.gunDown.isDown) {
      this.turretState = MoveState.BACKWARD;
      return;
    }

    this.turretState = MoveState.IDLE;
  }

  handleFireControl() {
    if (this.isPlayer) {
      if (this.control.fire.isDown && !this.isFired) {
        this.scene.events.emit(TANK_EVENTS.FIRE);
        this.isFired = true;
        return;
      }

      if (this.control.fire.isUp && this.isFired) {
        this.isFired = false;
      }
    }
  }

  // NOTE: Just for debugging collider, can remove
  handleFlipCollider() {
    if (this.scaleX > 0) {
      this.setSize(this.size.x, this.size.y);
    } else if (this.scaleX < 0) {
      this.setSize(-this.size.x, this.size.y);
    }
  }
}
