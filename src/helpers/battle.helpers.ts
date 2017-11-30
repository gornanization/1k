import { Battle, Game, Suit, Card, PlayersBid, Player, TrumpAnnouncement } from '../game.interfaces';
import { getNextTurn, getPlayerById, getPlayerTotalPoints } from './players.helpers';
import * as _ from 'lodash';
import { getHighestBid } from './bid.helpers';
import { getPointsByCard, getTrumpPointsBySuit, areCardsEqual, getCardsByColor, getCardWithHighestRank, cardsWithSpecificColorExists } from './cards.helpers';

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

export function getLeadCard(battle: Battle): Card {
    return battle.trickCards[0];
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
        .map(getPointsByCard)
        .sum()
        .value();
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

export function getPlayerByTrickCard(trickCard: Card, state: Game): string {
    return _.chain(state.battle.trickCards)
        .dropRightWhile(card => !areCardsEqual(card, trickCard))
        .reduce((player: string, card: Card) => {
            return player ? getNextTurn(state.players, player) : state.battle.leadPlayer;
        }, null)
        .value();
}

export function getTrickWinner(state: Game): string {
    const { battle } = state;
    const { trickCards } = battle;
    const leadCard = getLeadCard(battle);
    let winnerPlayerId = null;
    
    if(isTrumpAnnounced(battle)) {
        const trumpSuit: Suit = getTrumpSuit(battle);
        if (cardsWithSpecificColorExists(trickCards, trumpSuit)) {
            matchBySuit(trumpSuit);
        } else {
            //no trump cards taking part in the trick, so ordinary color matching flow:
            matchBySuit(leadCard.suit);
        }
    } else {
        matchBySuit(leadCard.suit);
    }

    return winnerPlayerId;

    function matchBySuit(suit: Suit) {
        const cardsMatchedByColor = getCardsByColor(trickCards, leadCard.suit);
        const highestRankedCard = getCardWithHighestRank(cardsMatchedByColor);
        winnerPlayerId = getPlayerByTrickCard(highestRankedCard, state);
    }
}