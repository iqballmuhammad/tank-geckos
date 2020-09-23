/* eslint-disable no-console */
import * as Phaser from 'phaser';
import Tank from '../Gameobjects/Tank';
import { BattleGroundPlayerList } from '../Interfaces/rooms/battleground';
import { TANK_EVENTS } from '../Interfaces/events/tank';
import { ClientChannel } from '@geckos.io/client';

export default class SampleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SampleScene' });
  }

  private tankList: Record<string, Tank> = {};
  private players: BattleGroundPlayerList = {};
  private channel!: ClientChannel;
  private gameoverText?: Phaser.GameObjects.Text;
  private pingText?: Phaser.GameObjects.Text;

  init({ channel }) {
    this.channel = channel;
  }

  preload(): void {
    this.load.image('turret', 'turret.png');
    this.load.image('tank', 'tank.png');
    this.load.image('bullet', 'bullet.png');
  }

  create(): void {
    this.setupWorld();
    this.setupControlListener();
    this.sendSpawnPlayer();
    this.sendPing();
    this.channel.on('updateObjects', (updates) => {
      let state = JSON.parse(updates.toString());
      this.players = state;
      if (this.players && Object.keys(this.players).length > 0) {
        this.spawnPlayer(this.players);
        this.updatePlayerData(this.players);
        this.updatePingText(this.players);
      }
    });
  }

  update(time: number, delta: number) {
    if (
      this.input.keyboard.addKey('P').isDown &&
      this.tankList[this.channel.id || '']?.isDeath
    ) {
      this.channel.emit('respawn');
    }
    this.sendPlayerControl();
  }

  sendPing() {
    setInterval(() => {
      this.channel.emit('ping', new Date().getTime());
    }, 500);
  }

  setupControlListener() {
    this.events.on(TANK_EVENTS.FIRE, () => this.channel.emit('fire'), this);
  }

  setupWorld(): void {
    const { width, height } = this.game.scale;

    this.gameoverText = this.add.text(
      width / 2,
      height / 2,
      'Press P to respawn',
      { font: '65px Arial', fill: '#000000', align: 'center' }
    );

    this.gameoverText.setOrigin(0.5, 0.5);
    this.gameoverText.setVisible(false);

    this.pingText = this.add.text(width, 0, '?ms', {
      font: '12px Arial',
      fill: '#000000',
      align: 'center',
    });
    this.pingText.setOrigin(1, 0);
    this.pingText.setAlpha(0.75);
  }

  getPlayerServerPos(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      this.tankList[this.channel.id!].x,
      this.tankList[this.channel.id!].y
    );
  }

  updatePingText(players: BattleGroundPlayerList) {
    const player = players[this.channel.id || ''];
    if (player && typeof player?.ping === 'number')
      this.pingText?.setText(`${Number(player.ping)}ms`);
  }

  updatePlayerData(players: BattleGroundPlayerList) {
    Object.keys(players).forEach((playerId) => {
      if (this.tankList[playerId]) {
        const {
          positionX,
          positionY,
          scaleX,
          moveState,
          turretAngle,
          bullets,
          health,
          isDeath,
        } = players[playerId];
        const tank = this.tankList[playerId];

        tank.setPosition(positionX, positionY);
        tank.setScale(scaleX, tank.scaleY);
        tank.setTurretAngle(turretAngle);
        tank.updateBulletPool(bullets);
        tank.health = health;
        tank.setAliveStatus(!isDeath);
        if (this.channel.id !== playerId) tank.moveState = moveState;
      }
    });
  }

  sendSpawnPlayer() {
    if (!this.tankList[this.channel.id || '']) this.channel.emit('spawnTank');
  }

  sendPlayerControl() {
    if (this.tankList[this.channel.id || '']) {
      this.channel.emit('move', this.tankList[this.channel.id!].moveState);
      this.channel.emit(
        'turretMove',
        this.tankList[this.channel.id!].turretState
      );
    }
  }

  spawnPlayer(players: BattleGroundPlayerList) {
    console.log(players);
    Object.keys(players).forEach((sessionId) => {
      if (!this.tankList[sessionId]) {
        this.tankList[sessionId] = new Tank(
          this,
          this.channel.id === sessionId,
          players[sessionId].health
        );
        if (this.gameoverText)
          this.tankList[sessionId].setGameoverText(this.gameoverText);
      }
    });

    Object.keys(this.tankList).forEach((sessionId) => {
      if (!players[sessionId]) this.tankList[sessionId].destroy();
    });
  }
}
