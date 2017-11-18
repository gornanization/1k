import { Battle, Game, Suit, Card, PlayersBid, Player, TrumpAnnouncement } from '../game.interfaces';
import { getNextTurn, getPlayerById, getPlayerTotalPoints } from './players.helpers';
import * as _ from 'lodash';
import { getHighestBid } from './bid.helpers';
import { getPointsByCard, getTrumpPointsBySuit } from './cards.helpers';

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

export function roundPoints(points: number): number {
    const minor = (points % 10);
    const major = points - minor;

    return minor >= 5 ? major + 10 : major;
}

export function calculatePointsByPlayer(state: Game, player: string): number {
    const {player: leadPlayer, bid: leadBidValue}: PlayersBid = getHighestBid(state.bid);
    const playerPoints = getPlayerTotalPoints(getPlayerById(state.players, player));

    const trumpPoints = _.chain(state.battle.trumpAnnouncements)
        .filter((trumpAnnouncement: TrumpAnnouncement) => trumpAnnouncement.player === player)
        .map('suit')
        .map(getTrumpPointsBySuit)
        .sum()
        .value();

    const cardPoints = _.chain(state.battle.wonCards[player])
        .map(getPointsByCard)
        .sum()
        .value();

    const totalPoints = trumpPoints + cardPoints;

    if (leadPlayer === player) {
        return (totalPoints >= leadBidValue) ? leadBidValue : -leadBidValue
    } else {
        return playerPoints >= state.settings.barrelPointsLimit ? 0 : roundPoints(totalPoints);
    }
}