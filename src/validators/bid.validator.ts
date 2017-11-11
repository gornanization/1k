import { Game, PlayersBid, Phase } from '../game.interfaces';
import { Bid } from '../game.actions';
import { getNextTurn } from '../helpers/players.helpers';
import { hasMarriage } from '../helpers/cards.helpers';
import * as _ from 'lodash';
import { hasPlayerAlreadyPassed, isMaxBid, hasTwoPasses, getHighestBid, isAchievableBid, isValidBidValue } from '../helpers/bid.helpers';

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
        console.log(hasPlayerAlreadyPassed(state.bid, action.player))
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

export function isBiddingFinished(state: Game): boolean {
    if (state.bid.length === 0) return false;

    const isMax = _.chain(state.bid)
        .head()
        .thru(isMaxBid)
        .value();

    const hasTwoPlayerPasses = hasTwoPasses(state.bid);

    return hasTwoPlayerPasses || isMax;
}
