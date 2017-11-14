import { Battle, Game, Suit, Card } from '../game.interfaces';
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

export function isTableEmpty(battle: Battle): boolean {
    return battle.trickCards.length === 0;
}

export function getLeadCard(battle: Battle): Card {
    return battle.trickCards[0];
}