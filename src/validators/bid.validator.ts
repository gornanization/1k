import { Game, PlayersBid } from '../game.interfaces';
import { Bid } from '../game.actions';
import { getNextTurn } from '../helpers/players.helpers';
import { hasMarriage } from '../helpers/cards.helpers';
import * as _ from 'lodash';

export function canBid(state: Game, action: Bid): boolean {
    const playerId = action.player;
    const playerCards = state.cards[playerId];

    const lastBiddingPlayerId = state.bid[0].player;
    const nextAllowedPlayerToBid = getNextTurn(state.players, lastBiddingPlayerId);

    const hasPlayerMarriage = hasMarriage(playerCards);

    console.log(nextAllowedPlayerToBid, playerCards, hasPlayerMarriage);
    return true;
};

export function isBiddingFinished(state: Game): boolean {

    const twoPassAvailable = _.chain(state.bid)
        .filter((playerBid: PlayersBid) => playerBid.pass)
        .thru((passedBids) => passedBids.length === 2)
        .value()

    const isMax = state.bid[0].bid === 300;

    return twoPassAvailable || isMax;
}
