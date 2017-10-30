import { Game } from '../game.interfaces';
import { Bid } from '../game.actions';
import { getNextTurn, hasMarriage } from '../game.helpers';

export function canBid(state: Game, action: Bid): boolean {
    const playerId = action.player;
    const playerCards = state.cards[playerId];

    const lastBiddingPlayerId = state.bid[0].player;
    const nextPlayerToBid = getNextTurn(state.players, lastBiddingPlayerId);

    const hasPlayerMarriage = hasMarriage(playerCards);

    console.log(nextPlayerToBid, playerCards, hasPlayerMarriage);
    return true;
};
