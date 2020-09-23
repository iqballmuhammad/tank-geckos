import { GameAssetConfig } from '../Interfaces';

const gameAssets: GameAssetConfig[] = [
  {
    key: 'tank',
    type: 'image',
    local: 'tank.png',
  },
  {
    key: 'turret',
    type: 'image',
    local: 'turret.png',
  },
  {
    key: 'gun',
    type: 'image',
    local: 'gun.png',
  },
  {
    key: 'bullet',
    type: 'image',
    local: 'bullet.png',
  },
  {
    key: 'platform',
    type: 'image',
    local: 'platform.png',
  },
  {
    key: 'explosion',
    type: 'spritesheet',
    local: 'explosion.png',
    config: {
      frameWidth: 64,
    },
  },
];

export default gameAssets;
