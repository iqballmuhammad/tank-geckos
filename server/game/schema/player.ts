import BulletSchema from './bullet';

export default class PlayerSchema {
  ping: number = 0;
  velocity: number = 0;
  health: number = 5;
  damage: number = 1;
  name: string = '';
  positionX: number = 0;
  positionY: number = 0;
  scaleX: number = 0;
  moveState: number = 0;
  turretState: number = 0;
  turretAngle: number = 0;
  bullets: BulletSchema[] = [];
  isDeath: boolean = false;
}
