import * as Phaser from 'phaser';
import client from '@geckos.io/client';
import { GameAssetConfig } from '../Interfaces';
import gameAssets from '../Constants/gameAssets';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  loadData(assetList: GameAssetConfig[] = []): void {
    assetList.forEach((asset) => {
      switch (asset.type) {
        case 'image':
          this.load.image(asset.key, asset.local);
          break;
        case 'spritesheet':
          this.load.spritesheet(
            asset.key,
            asset.local,
            asset.config as Phaser.Types.Loader.FileTypes.ImageFrameConfig
          );
          break;
        case 'audio':
          this.load.audio(asset.key, asset.local, asset.config);
          break;
        case 'svg':
          this.load.svg(
            asset.key,
            asset.local,
            asset.config as Phaser.Types.Loader.FileTypes.SVGSizeConfig
          );
          break;
        case 'json':
          this.load.json(asset.key, asset.local, asset.config as string);
          break;
      }
    });
  }

  onLoadComplete(): void {
    const channel = client({
      port: null,
      url: `${location.protocol}//${location.hostname}:1444/tank-geckos`,
    });

    channel.onConnect((error) => {
      if (error) console.error(error.message);

      channel.on('ready', () => {
        this.scene.start('SampleScene', { channel });
      });
    });
  }

  preload(): void {
    this.loadData(gameAssets);
    this.load.on('complete', this.onLoadComplete.bind(this));
  }
}
