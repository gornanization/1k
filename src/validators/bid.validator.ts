import { Game, PlayersBid, Phase } from '../game.interfaces';
import { Bid, SHARE_STOCK } from '../game.actions';
import { getNextTurn } from '../helpers/players.helpers';
import { hasMarriage } from '../helpers/cards.helpers';
import * as _ from 'lodash';
import { hasPlayerAlreadyPassed, isMaxBid, hasTwoPasses, getHighestBid, isAchievableBid, isValidBidValue, getBidWinner } from '../helpers/bid.helpers';
import { isTableEmpty, getTotalWonCards } from '../helpers/battle.helpers';

export function canBid(state: Game, action: Bid): boolean {
    if (state.phase !== Phase.BIDDING_IN_PROGRESS) {
        return false;
    }

    if(isBiddingFinished(state)) {
        return false
    }

    if (!isAchievableBid(action)) {
        return false;
    }

    if (!isValidBidValue(action)) {
        return false;
    }

    const lastBiddingPlayerId = state.bid[0].player;
    const nextAllowedPlayerToBid = getNextTurn(state.players, lastBiddingPlayerId);
    if (action.player !== nextAllowedPlayerToBid) {
        return false;
    }

    if (action.pass) {
        if(hasPlayerAlreadyPassed(state.bid, action.player)) {
            return false;
        } else {
            return true;
        }
    }

    const lastBidValue = getHighestBid(state.bid);
    if (action.bid <= lastBidValue.bid) {
        return false;
    }

    const playerId = action.player;
    const playerCards = state.cards[playerId];
    const hasPlayerMarriage = hasMarriage(playerCards);

    if (action.bid >= 130 && !hasPlayerMarriage) {
        return false;
    }
    return true;
};

export function canIncreaseBid(state: Game, action: Bid): boolean {
    if (_.includes([
        Phase.BIDDING_FINISHED,
        Phase.SHARE_STOCK,
        Phase.ASSIGN_STOCK,
        Phase.BATTLE_START,
        Phase.TRICK_START,
        Phase.TRICK_IN_PROGRESS
    ], state.phase)) {
        return false;
    }

    if (!isAchievableBid(action)) {
        return false;
    }

    if (!isValidBidValue(action)) {
        return false;
    }

    if (action.pass) {
        return false;
    }

    if (getBidWinner(state.bid).player !== action.player) {
        return false;
    }

    const lastBidValue = getHighestBid(state.bid);
    if (action.bid <= lastBidValue.bid) {
        return false;
    }

    if (action.bid >= 130 && !hasMarriage(state.cards[action.player])) {
        return false;
    }

    if(state.phase === Phase.TRICK_IN_PROGRESS) {
        if (!isTableEmpty(state.battle)) { return false; } //some cards throw on the table
        if (getTotalWonCards(state) > 0) { return false; } //some tricks already finished
    }

    return true;
};

export function isBiddingFinished(state: Game): boolean {
    if (state.bid.length === 0) return false;

    const isMax = _.chain(state.bid)
        .head()
        .thru(isMaxBid)
        .value();

    const hasTwoPlayerPasses = hasTwoPasses(state.bid);

    return hasTwoPlayerPasses || isMax;
}
