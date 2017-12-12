import { Game, Phase } from '../game.interfaces';
import { getUniqueBidders, getBidWinner } from '../helpers/bid.helpers';
import * as _ from 'lodash';
import { ShareStock } from '../game.actions';
import { hasEightCards, getCard } from '../helpers/cards.helpers';

export function canShareStock(state: Game, action: ShareStock): boolean {
    if(state.phase !== Phase.SHARE_STOCK) { return false; }

    const winnerPlayerId = getBidWinner(state.bid).player;
    const targetPlayerId = action.targetPlayer;
    const playerId = action.player;

    if(playerId !== winnerPlayerId) { return false; }

    const targetPlayerCards = state.cards[targetPlayerId];

    if(!targetPlayerCards || targetPlayerCards.length === 8) { return false; }

    return !!getCard(state.cards[playerId], action.card);
}

export function isSharingStockFinished(state: Game): boolean {
    return _.chain(getUniqueBidders(state.bid))
        .every(playerId => hasEightCards(state.cards[playerId]))
        .value();
}