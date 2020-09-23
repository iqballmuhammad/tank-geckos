import geckos, { Data, GeckosServer, ServerChannel } from '@geckos.io/server';
import { iceServers } from '@geckos.io/server';
import * as Phaser from 'phaser';
import PlayerSchema from '../schema/player';
import BulletSchema from '../schema/bullet';
import Tank from '../gameObjects/Tank';
import WorldSchema from '../schema/world';

export default class GameScene extends Phaser.Scene {
  private playerList: Record<string, Tank> = {};
  private playerId: number;
  private state: WorldSchema = new WorldSchema();
  private io!: GeckosServer;

  constructor() {
    super({ key: 'GameScene' });
    this.playerId = 0;
  }

  init() {
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    });
    // @ts-ignore
    this.io.addServer(this.game.server);
  }

  create() {
    this.io.onConnection((channel) => {
      channel.onDisconnect(() => {
        this.removePlayer(channel.id!);
      });
      channel.on('spawnTank', () => {
        this.spawnTank(channel);
      });
      channel.on('move', (message) => {
        this.playerList[channel.id!].moveState = Number(message);
      });
      channel.on('turretMove', (message) => {
        this.playerList[channel.id!].turretState = Number(message);
      });
      channel.on('fire', () => {
        this.playerList[channel.id!].fireBullet();
      });
      channel.on('respawn', () => {
        this.respawnTank(channel);
      });
      channel.on('ping', (message) => {
        this.updatePing(channel, Number(message));
      });
      channel.emit('ready');
    });
  }

  update() {
    this.syncPlayer();
  }

  getId() {
    return this.playerId++;
  }

  getState() {
    return JSON.stringify(this.state.players);
  }

  syncPlayer() {
    Object.keys(this.playerList).forEach((playerId) => {
      const player: PlayerSchema = this.state.players[playerId];

      if (player) {
        player.positionX = this.playerList[playerId].x;
        player.positionY = this.playerList[playerId].y;
        player.scaleX = this.playerList[playerId].scaleX;
        player.turretAngle = this.playerList[playerId].getTurretAngle();
        player.health = this.playerList[playerId].health;
        player.isDeath = this.playerList[playerId].isDeath;

        const bulletPool = this.playerList[playerId].getBulletPool();
        bulletPool.forEach((bullet, i) => {
          const bulletSchema = player.bullets[i]
            ? player.bullets[i]
            : new BulletSchema();
          bulletSchema.x = bullet.x;
          bulletSchema.y = bullet.y;
          bulletSchema.active = bullet.active;
          bulletSchema.angle = bullet.angle;
          bulletSchema.isFlip = bullet.flipX;

          if (!player.bullets[i]) player.bullets[i] = bulletSchema;
        });
      }
    });
    const updates = this.getState();
    this.io.room().emit('updateObjects', updates);
  }

  removePlayer(playerId: string) {
    this.playerList[playerId].setAliveStatus(false);
    delete this.state.players[playerId];
    const updates = this.getState();
    this.io.room().emit('updateObjects', updates);
    delete this.playerList[playerId];
    console.log(`player ${playerId} removed`);
  }

  updatePing(channel: ServerChannel, timestamp: number) {
    const currTimestamp = new Date().getTime();
    const ping = currTimestamp - timestamp;
    this.state.players[channel.id!].ping = ping;
    const updates = this.getState();
    channel.emit('updateObjects', updates);
  }

  respawnTank(channel: ServerChannel) {
    const tank = this.playerList[channel.id!];
    tank.setAliveStatus(true);
    tank.setRandomPosition();
  }

  spawnTank(channel: ServerChannel) {
    if (this.playerList[channel.id!]) return;
    const player = new PlayerSchema();
    this.state.players[channel.id!] = player;
    this.playerList[channel.id!] = new Tank(
      this,
      player.positionX,
      player.positionY,
      channel
    );
    Object.keys(this.playerList).forEach((playerId) => {
      if (!this.state.players[playerId]) {
        this.removePlayer(playerId);
        return;
      }
      if (playerId !== channel.id)
        this.physics.add.collider(
          this.playerList[channel.id!],
          this.playerList[playerId],
          undefined,
          undefined,
          this
        );
      this.playerList[playerId].updateBulletCollider(this.playerList);
    });
    const updates = this.getState();
    this.io.room().emit('updateObjects', updates);
    console.log(`Spawned player with id ${channel.id}`);
  }
}
