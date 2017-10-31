import * as _ from 'lodash';
import { Suit, Rank, Card } from '../game.interfaces';

export function createCard(pattern: string): Card {
    const CARD_PATTERN_REGEX = /([A|K|Q|J|9]|10)([♥|♦|♣|♠])/;

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

export function createDeck(): Card[] {
    function getDeckBySuit(suit: Suit): Card[] {
        return [
            { rank: Rank.Ace, suit }, { rank: Rank.King, suit },
            { rank: Rank.Queen, suit }, { rank: Rank.Jack, suit },
            { rank: Rank.Ten, suit }, { rank: Rank.Nine, suit }
        ];
    }
    return [
        ...getDeckBySuit(Suit.Heart),
        ...getDeckBySuit(Suit.Diamond),
        ...getDeckBySuit(Suit.Club),
        ...getDeckBySuit(Suit.Spade)
    ];
}