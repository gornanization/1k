import { Game, Phase } from '../game.interfaces';
import { getUniqueBidders, getBidWinner } from '../helpers/bid.helpers';
import * as _ from 'lodash';
import { ShareStock } from '../game.actions';
import { hasEightCards, getCard } from '../helpers/cards.helpers';

export function canShareStock(state: Game, action: ShareStock): boolean {
    if (state.phase == Phase.SHARE_STOCK) {
        const winnerPlayerId = getBidWinner(state.bid).player;
        const winnerPlayerCards = state.cards[winnerPlayerId];
        if (getCard(winnerPlayerCards, action.card)) {
            return true
        }
    }
    return false;
}

export function isSharingStockFinished(state: Game): boolean {
    return _.chain(getUniqueBidders(state.bid))
        .every(playerId => hasEightCards(state.cards[playerId]))
        .value();
}