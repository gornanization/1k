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

export function toString(card: Card): string {
    return card.rank + card.suit;
}

export function createCards(input: number|string[] = null): Card[] {
    if (typeof input === 'number') {
        return _.chain(createDeck())
        .shuffle()
        .sampleSize(input)
        .value();
    } else {
        return _.chain(input)
        .map(createCard)
        .value();
    }
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

export function createShuffledDeck(): Card[] {
    return _.chain(createDeck())
        .shuffle()
        .value();
}

export function getCard(cards: Card[], card: Card): Card {
    return _.find(cards, ({suit, rank}) => card.suit === suit && card.rank === rank);
}

export function cardExistsIn(cards: Card[], card: Card): boolean {
    return !!getCard(cards, card);
}

export function hasEightCards(cards: Card[]): boolean {
    return cards.length === 8;
}

export function getPointsByCard(card: Card): number {
    return {
        [Rank.Ace]: 11,
        [Rank.King]: 4,
        [Rank.Queen]: 3,
        [Rank.Jack]: 2,
        [Rank.Ten]: 10,
        [Rank.Nine]: 0,
    }[card.rank];
}

export function getTrumpPointsBySuit(suit: Suit): number {
    return {
        [Suit.Heart]: 100,
        [Suit.Diamond]: 80,
        [Suit.Club]: 60,
        [Suit.Spade]: 40
    }[suit];
}

export function haveCardsEqualColor(...cards: Card[]): boolean {
    return !!_.chain(cards)
        .map('suit')
        .reduce((suit1: Suit, suit2: Suit) => (suit1 === suit2) ? suit1 : NaN)
        .value();
}

export function getCardsByColor(cards: Card[], color: Suit): Card[] {
    return _.chain(cards)
        .filter((card: Card) => card.suit === color)
        .value();
}

export function cardsWithSpecificColorExists(cards: Card[], color: Suit): boolean {
    return getCardsByColor(cards, color).length > 0;
}

export function getCardWithHighestRank(cards: Card[]): Card {
    return _.chain(cards)
        .maxBy(getPointsByCard)
        .value();
}

export function areCardsEqual(card1: Card, card2: Card): boolean {
    return _.eq(card1, card2);
}