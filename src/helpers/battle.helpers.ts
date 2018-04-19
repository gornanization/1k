import { Battle, Game, Suit, Card, PlayersBid, Player, TrumpAnnouncement, CardPattern } from '../game.interfaces';
import { getNextTurn, getPlayerById, getPlayerTotalPoints } from './players.helpers';
import * as _ from 'lodash';
import { getHighestBid } from './bid.helpers';
import { getPointsByCard, getTrumpPointsBySuit, areCardsEqual, getCardsByColor, getCardWithHighestRank, cardsWithSpecificColorExists, toCard } from './cards.helpers';

export function getNextTrickTurn(state: Game, player: string = state.battle.leadPlayer): string {
    const gamePlayers = state.players;
    const { battle } = state;
    return _.reduce(battle.trickCards, (nextPlayer) => getNextTurn(gamePlayers, nextPlayer), player);
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

export function getLeadCard(battle: Battle): CardPattern {
    return battle.trickCards[0];
}

export function getCardSuit(card: CardPattern): Suit {
    return toCard(card).suit;
}

export function roundPoints(points: number): number {
    const minor = (points % 10);
    const major = points - minor;

    return minor >= 5 ? major + 10 : major;
}

export function calculateTrumpPointsForPlayer(state: Game, player: string): number {
    return _.chain(state.battle.trumpAnnouncements)
        .filter((trumpAnnouncement: TrumpAnnouncement) => trumpAnnouncement.player === player)
        .map('suit')
        .map(getTrumpPointsBySuit)
        .sum()
        .value();  
}

export function calculateCardPointsForPlayer(state: Game, player: string): number {
    return _.chain(state.battle.wonCards[player])
        .map(toCard)
        .map(getPointsByCard)
        .sum()
        .value();
}

export function getTotalWonCards(state: Game): number {
    return _.reduce(state.battle.wonCards, (totalCards, cards) => {
        return totalCards + cards.length;
    }, 0);
}

export function calculatePointsByPlayer(state: Game, player: string): number {
    const {player: leadPlayer, bid: leadBidValue}: PlayersBid = getHighestBid(state.bid);
    
    const playerPoints = getPlayerTotalPoints(getPlayerById(state.players, player));
    const trumpPoints = calculateTrumpPointsForPlayer(state, player);
    const cardPoints = calculateCardPointsForPlayer(state, player);

    const totalPoints = trumpPoints + cardPoints;
    
    if (leadPlayer === player) {
        return (totalPoints >= leadBidValue) ? leadBidValue : -leadBidValue
    } else {
        return playerPoints >= state.settings.barrelPointsLimit ? 0 : roundPoints(totalPoints);
    }
}

export function getPlayerByTrickCard(trickCard: CardPattern, state: Game): string {
    const { battle: { leadPlayer, trickCards }, players } = state;

    return _.chain(trickCards)
        .dropRightWhile(card => !areCardsEqual(card, trickCard))
        .reduce((player: string) => player ? getNextTurn(players, player) : leadPlayer, null)
        .value();
}

export function getTrickWinner(state: Game): string {
    const { battle } = state;
    const { trickCards } = battle;
    const leadCard: CardPattern = getLeadCard(battle);
    let winnerPlayerId = null;
    
    console.log('test!')
    if(isTrumpAnnounced(battle)) {
        console.log('test2!')
        const trumpSuit: Suit = getTrumpSuit(battle);
        if (cardsWithSpecificColorExists(trickCards, trumpSuit)) {
            console.log('test3!')
            matchBySuit(trumpSuit);
        } else {
            //no trump cards taking part in the trick, so ordinary color matching flow:
            matchBySuit(getCardSuit(leadCard));
        }
    } else {
        matchBySuit(getCardSuit(leadCard));
    }

    return winnerPlayerId;

    function matchBySuit(suit: Suit) {
        const cardsMatchedByColor = getCardsByColor(trickCards, suit);
        const highestRankedCard = getCardWithHighestRank(cardsMatchedByColor);
        winnerPlayerId = getPlayerByTrickCard(highestRankedCard, state);
    }
}