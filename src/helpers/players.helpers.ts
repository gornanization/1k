import { Player, Card, Suit, Rank } from '../game.interfaces';
import * as _ from 'lodash';

export function getNextTurn(players: Player[], playerId: string): string {
    const playerIndex = _.findIndex(players, ({ id }) => playerId === id);
    const nextPlayerIndex = playerIndex + 1 === players.length ? 0 : playerIndex + 1;
    
    return players[nextPlayerIndex].id;
}

export function getPlayerById(players: Player[], id: string): Player {
    return _.find(players, (player: Player) => player.id === id) || null;
}

export function playerExists(players: Player[], id: string) {
    return !!getPlayerById(players, id);
}

export function getMaxPlayersCount() {
    return 3;
}

export function maxPlayersCountReached(players: Player[]) {
    return players.length === getMaxPlayersCount();
}
