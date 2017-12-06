import { Player, Card, Suit, Rank, Game } from '../game.interfaces';
import * as _ from 'lodash';
import { isRospisat } from './game.helpers';

export function getNextTurn(players: Player[], playerId: string): string {
    const playerIndex = _.findIndex(players, ({ id }) => playerId === id);
    const nextPlayerIndex = playerIndex + 1 === players.length ? 0 : playerIndex + 1;
    
    return players[nextPlayerIndex].id;
}

export function getPlayerById(players: Player[], id: string): Player {
    return _.find(players, (player: Player) => player.id === id);
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

export function getPlayerTotalPoints(player: Player): number {
    return _.chain(player.battlePoints)
        .compact() // remove bombs (null) and 0 points 
        .sum()
        .value();       
}

export function getWinner(players: Player[]): Player|null {
    return _.chain(players)
        .find(player => getPlayerTotalPoints(player) >= 1000)
        .value();
}

export function getTotalRospisatByPlayer(state: Game, player: string): number {
    const battlePoints = getPlayerById(state.players, player).battlePoints;
    return _.chain(battlePoints)
        .countBy(isRospisat)
        .value();
}