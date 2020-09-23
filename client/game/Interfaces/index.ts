import { Types } from 'phaser';

export interface GameAssetConfig {
  type: 'image' | 'spritesheet' | 'audio' | 'svg' | 'json';
  key: string;
  local?: string;
  server?: string;
  config?: Types.Loader.FileTypes.ImageFrameConfig | string;
}
