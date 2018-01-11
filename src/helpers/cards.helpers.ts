import * as _ from 'lodash';
import { Suit, Rank, Card, CardPattern } from '../game.interfaces';

export function toCard(pattern: CardPattern): Card {
    const CARD_PATTERN_REGEX = /([A|K|Q|J|9]|10)([♥|♦|♣|♠])/;

    const result = CARD_PATTERN_REGEX.exec(pattern);
    const [, rank, suit] = result;
    return result && {
        suit: suit as Suit,
        rank: rank as Rank
    };
}

export function toCardPattern({ rank, suit }: Card) : CardPattern {
    return [rank, suit].join('');
}

export function createCardPatterns(total: number): CardPattern[] {
    return _.chain(createDeck())
        .shuffle()
        .sampleSize(total)
        .value();
}

export function hasKingAndQueen(cards: Card[]): boolean {
    return _.some(cards, {rank: Rank.King}) && _.some(cards, {rank: Rank.Queen});
}

export function isKingOrQueen(card: CardPattern): boolean {
    const parsedCard = toCard(card);
    return parsedCard.rank === Rank.King || parsedCard.rank === Rank.Queen;
}

export function getMarriages(cards: CardPattern[]): Suit[] {
    return _.chain(cards)
        .map(toCard)
        .groupBy(card => card.suit)
        .reduce((marriages, suitCards, suit) => {
            return hasKingAndQueen(suitCards) ? [suit, ...marriages] : marriages  
        }, [])
        .value();
}

export function hasMarriageOfSuit(cards: CardPattern[], suit: Suit): boolean {
    return _.chain(getMarriages(cards))
        .includes(suit)
        .value();
}

export function hasMarriage(cards: CardPattern[]): boolean {
    return getMarriages(cards).length > 0;
}

export function createDeck(): CardPattern[] {
    function getDeckBySuit(suit: Suit): Card[] {
        return [
            { rank: Rank.Ace, suit }, { rank: Rank.King, suit },
            { rank: Rank.Queen, suit }, { rank: Rank.Jack, suit },
            { rank: Rank.Ten, suit }, { rank: Rank.Nine, suit }
        ];
    }
    return [
        ...getDeckBySuit(Suit.Heart).map(toCardPattern),
        ...getDeckBySuit(Suit.Diamond).map(toCardPattern),
        ...getDeckBySuit(Suit.Club).map(toCardPattern),
        ...getDeckBySuit(Suit.Spade).map(toCardPattern)
    ];
}

export function getCard(cards: CardPattern[], card: CardPattern): CardPattern {
    return _.find(cards, _card => _card === card);
}

export function cardExistsIn(cards: CardPattern[], card: CardPattern): boolean {
    return !!getCard(cards, card);
}

export function hasEightCards(cards: CardPattern[]): boolean {
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

export function getCardsByColor(cards: CardPattern[], color: Suit): CardPattern[] {
    return _.chain(cards)
        .map(toCard)
        .filter((card: Card) => card.suit === color)
        .map(toCardPattern)
        .value();
}

export function cardsWithSpecificColorExists(cards: CardPattern[], color: Suit): boolean {
    return getCardsByColor(cards, color).length > 0;
}

export function getCardWithHighestRank(cards: CardPattern[]): CardPattern {
    const card: Card = _.chain(cards)
        .map(toCard)
        .maxBy(getPointsByCard)
        .value();
    
        return toCardPattern(card);
}

export function areCardsEqual(card1: CardPattern, card2: CardPattern): boolean {
    return card1 === card2;
}