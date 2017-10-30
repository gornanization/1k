import { Player, Card, Suit, Rank } from './game.interfaces';
import * as _ from 'lodash';

export function getNextTurn(players: Player[], playerId: string): string {
    const playerIndex = _.findIndex(players, ({ id }) => playerId === id);
    const nextPlayerIndex = playerIndex + 1 === players.length ? 0 : playerIndex + 1;
    return players[nextPlayerIndex].id;
}

const CARD_PATTERN_REGEX = /([A|K|Q|J|9]|10)([♥|♦|♣|♠])/;

export function createCard(pattern: string): Card {
    const result = CARD_PATTERN_REGEX.exec(pattern);
    const [, rank, suit] = result;
    return result && {
        suit: suit as Suit,
        rank: rank as Rank
    };
}

export function hasKingAndQueen(cards: Card[]): boolean {
    return _.some(cards, {rank: Rank.King}) && _.some(cards, {rank: Rank.Queen});
}

export function getMarriages(cards: Card[]): Suit[] {
    return _.chain(cards)
        .groupBy(card => card.suit)
        .reduce((marriages, suitCards, suit) => {
            return hasKingAndQueen(suitCards) ? [suit, ...marriages] : marriages  
        }, [])
        .value();
}

export function hasMarriage(cards: Card[]): boolean {
    return getMarriages(cards).length > 0;
}
    