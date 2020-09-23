export interface BattleGroundRoom {
  players: Record<string, BattleGroundPlayer>;
  isGameReady: boolean;
}

export interface BattleGroundPlayer {
  ping: number;
  positionX: number;
  positionY: number;
  scaleX: number;
  velocity: number;
  health: number;
  damage: number;
  name: string;
  moveState: number;
  turretState: number;
  turretAngle: number;
  bullets: BattleGroundBullet[];
  isDeath: boolean;
}

export type BattleGroundPlayerList = Record<string, BattleGroundPlayer>;

export type BattleGroundMoveState = 'forward' | 'backward' | 'none';

export interface BattleGroundBullet {
  x: number;
  y: number;
  angle: number;
  isFlip: boolean;
  active: boolean;
}
