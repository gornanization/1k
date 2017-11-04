import { Game, PlayersBid } from '../game.interfaces';
import { Bid } from '../game.actions';
import { getNextTurn } from '../helpers/players.helpers';
import { hasMarriage } from '../helpers/cards.helpers';
import * as _ from 'lodash';
import { isMaxBid, hasTwoPasses } from '../helpers/bid.helpers';

export function canBid(state: Game, action: Bid): boolean {
    const playerId = action.player;
    const playerCards = state.cards[playerId];

    const lastBiddingPlayerId = state.bid[0].player;
    const nextAllowedPlayerToBid = getNextTurn(state.players, lastBiddingPlayerId);

    const hasPlayerMarriage = hasMarriage(playerCards);

    return true;
};

export function isBiddingFinished(state: Game): boolean {
    if (state.bid.length === 0) {
        return false;
    }
    const isMax = _.chain(state.bid)
        .head()
        .thru(isMaxBid)
        .value();

    return (hasTwoPasses(state.bid) || isMax);
}
