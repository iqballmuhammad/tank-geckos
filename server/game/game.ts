import config from './config';

export default class PhaserGame extends Phaser.Game {
  server: any;
  constructor(server) {
    super(config);
    this.server = server;
  }
}
