import PlayerSchema from './player';

export default class WorldSchema {
  players: Record<string, PlayerSchema> = {};
}
