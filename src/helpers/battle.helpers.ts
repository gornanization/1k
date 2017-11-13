import { Battle, Game, Suit } from '../game.interfaces';
import { getNextTurn } from './players.helpers';
import * as _ from 'lodash';

export function getNextTrickTurn(state: Game): string {
    const gamePlayers = state.players;
    const { battle } = state;

    return _.reduce(battle.trickCards, (nextPlayer) => getNextTurn(gamePlayers, nextPlayer), battle.leadPlayer);
}

export function getTrumpSuit(battle: Battle): Suit | null {
    return battle.trumpAnnouncements.length > 0 ? battle.trumpAnnouncements[0].suit : null;
}

export function isTrumpAnnounced(battle: Battle): boolean {
    return !!getTrumpSuit(battle);
}
